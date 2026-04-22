import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { charityUpdateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = charityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { charity_id, charity_percentage } = parsed.data;

  const [{ data: charity }, { data: subscription }] = await Promise.all([
    adminSupabase
      .from("charities")
      .select("id")
      .eq("id", charity_id)
      .eq("is_active", true)
      .maybeSingle(),
    adminSupabase
      .from("subscriptions")
      .select("id, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!charity) {
    return NextResponse.json({ error: "Charity not found" }, { status: 404 });
  }

  const hasSubscriberAccess =
    subscription?.status === "active" ||
    (subscription?.status === "cancelled" &&
      !!subscription.current_period_end &&
      new Date(subscription.current_period_end).getTime() > Date.now());

  if (!subscription || !hasSubscriberAccess) {
    return NextResponse.json(
      { error: "Active subscription required" },
      { status: 403 },
    );
  }

  const { error } = await (adminSupabase.from("subscriptions") as any)
    .update({
      selected_charity_id: charity_id,
      charity_percentage,
    })
    .eq("id", subscription.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
