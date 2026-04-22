import { NextResponse, type NextRequest } from "next/server";
import { PLANS } from "@/lib/dodo/client";
import { requireAdminRoute } from "@/lib/admin";
import { adminSubscriptionUpdateSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminRoute();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await req.json();
  const parsed = adminSubscriptionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: existingSubscription } = await auth.adminSupabase
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existingSubscription) {
    return NextResponse.json(
      { error: "No subscription found for this user." },
      { status: 404 },
    );
  }

  const currentPeriodEnd = parsed.data.current_period_end
    ? new Date(`${parsed.data.current_period_end}T00:00:00.000Z`).toISOString()
    : null;

  const updateData = {
    plan: parsed.data.plan,
    status: parsed.data.status,
    amount_pence: PLANS[parsed.data.plan].amountPence,
    charity_percentage: parsed.data.charity_percentage,
    selected_charity_id: parsed.data.selected_charity_id,
    current_period_end: currentPeriodEnd,
    cancelled_at:
      parsed.data.status === "cancelled" ? new Date().toISOString() : null,
  };

  const { data, error } = await (auth.adminSupabase.from("subscriptions") as any)
    .update(updateData)
    .eq("id", existingSubscription.id)
    .select(
      "id, plan, status, charity_percentage, selected_charity_id, current_period_end, amount_pence, currency, dodo_subscription_id, created_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}
