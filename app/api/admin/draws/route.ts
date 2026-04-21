import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { drawCreateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as {
    data: { role?: string | null } | null;
  };
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = drawCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  // Check if a draw for this month already exists
  const { data: existing } = await adminSupabase
    .from("draws")
    .select("id")
    .eq("draw_month", parsed.data.draw_month)
    .single();

  if (existing)
    return NextResponse.json(
      { error: "A draw for this month already exists." },
      { status: 409 },
    );

  // Check for jackpot rollover from last unpaid jackpot draw
  const { data: rolledDraw } = (await adminSupabase
    .from("draws")
    .select("jackpot_amount")
    .eq("jackpot_rolled", true)
    .eq("status", "published")
    .order("draw_month", { ascending: false })
    .limit(1)
    .single()) as {
    data: { jackpot_amount?: number | null } | null;
  };

  const rolledJackpot = rolledDraw ? Number(rolledDraw.jackpot_amount ?? 0) : 0;

  const { data: draw, error } = await (adminSupabase.from("draws") as any)
    .insert({
      draw_month: parsed.data.draw_month,
      logic: parsed.data.logic,
      jackpot_amount: (body.jackpot_amount ?? 0) + rolledJackpot,
      pool_4match: body.pool_4match ?? 0,
      pool_3match: body.pool_3match ?? 0,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ draw });
}
