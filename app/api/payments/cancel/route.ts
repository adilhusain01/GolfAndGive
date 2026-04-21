import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import dodo from "@/lib/dodo/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { subscriptionId } = await req.json();
  if (!subscriptionId)
    return NextResponse.json(
      { error: "subscriptionId required" },
      { status: 400 },
    );

  // Verify the sub belongs to this user
  const { data: sub } = (await supabase
    .from("subscriptions")
    .select("id, dodo_subscription_id")
    .eq("user_id", user.id)
    .eq("dodo_subscription_id", subscriptionId)
    .single()) as {
    data: { id: string; dodo_subscription_id?: string | null } | null;
  };

  if (!sub)
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );

  try {
    // Cancel via DodoPayments SDK
    await dodo.subscriptions.update(subscriptionId, { status: "cancelled" });
  } catch (err: any) {
    // If already cancelled or not found on Dodo side, still update local status
    console.warn("[cancel-sub] Dodo error:", err.message);
  }

  // Update local status
  const adminSupabase = createAdminClient();
  await (adminSupabase.from("subscriptions") as any)
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", sub.id);

  return NextResponse.json({ success: true });
}
