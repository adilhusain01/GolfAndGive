import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { winnerReviewSchema } from "@/lib/validations";
import { safelySendEmail, sendWinnerReviewEmail } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: authProfile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as {
    data: { role?: string | null } | null;
  };
  if (authProfile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = winnerReviewSchema.safeParse({
    winner_id: params.id,
    ...body,
  });
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { payment_status, admin_notes } = parsed.data;

  const updateData: any = {
    payment_status,
    admin_notes: admin_notes ?? null,
    proof_reviewed_at: new Date().toISOString(),
  };

  if (payment_status === "paid") {
    updateData.paid_at = new Date().toISOString();
  }

  const { error } = await (adminSupabase.from("winners") as any)
    .update(updateData)
    .eq("id", params.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: winner } = await adminSupabase
    .from("winners")
    .select(
      `
      prize_tier,
      profiles (full_name, email),
      draws (draw_month)
    `,
    )
    .eq("id", params.id)
    .maybeSingle();

  const profile = Array.isArray(winner?.profiles)
    ? winner.profiles[0]
    : winner?.profiles;
  const draw = Array.isArray(winner?.draws) ? winner.draws[0] : winner?.draws;

  const email = profile?.email;
  const drawMonth = draw?.draw_month;

  if (email && drawMonth && winner?.prize_tier) {
    await safelySendEmail(`winner review ${params.id}`, () =>
      sendWinnerReviewEmail({
        to: email,
        fullName: profile?.full_name,
        paymentStatus: payment_status,
        drawMonth,
        prizeTier: winner.prize_tier,
        adminNotes: admin_notes,
      }),
    );
  }

  return NextResponse.json({ success: true });
}
