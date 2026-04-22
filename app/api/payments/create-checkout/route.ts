import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import dodo, { PLANS } from "@/lib/dodo/client";
import { subscriptionCreateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await req.json();
    const parsed = subscriptionCreateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );

    const { plan, charity_id, charity_percentage } = parsed.data;
    const planConfig = PLANS[plan];
    const { data: existingSubscription } = await adminSupabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const alreadySubscribed =
      existingSubscription?.status === "active" ||
      (existingSubscription?.status === "cancelled" &&
        !!existingSubscription.current_period_end &&
        new Date(existingSubscription.current_period_end).getTime() > Date.now());

    if (alreadySubscribed) {
      return NextResponse.json(
        { error: "You already have an active subscription." },
        { status: 409 },
      );
    }

    // Get or fetch profile for customer name/email
    const { data: profile } = (await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()) as {
      data: { full_name?: string | null; email?: string | null } | null;
    };

    const checkout = await dodo.subscriptions.create({
      billing: {
        city: "Mumbai",
        country: "IN",
        state: "MH",
        street: "N/A",
        zipcode: "400001",
      },
      customer: {
        email: profile?.email ?? user.email!,
        name: profile?.full_name ?? "Subscriber",
      },
      product_id: planConfig.productId,
      quantity: 1,
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/success?plan=${plan}&charity=${charity_id}&pct=${charity_percentage}`,
      metadata: {
        user_id: user.id,
        plan,
        charity_id: charity_id,
        charity_percentage: String(charity_percentage),
      },
    });

    if (!checkout.payment_link) {
      return NextResponse.json(
        { error: "Checkout link could not be created" },
        { status: 502 },
      );
    }

    await (adminSupabase.from("subscriptions") as any).upsert(
      {
        user_id: user.id,
        plan,
        status: "inactive",
        dodo_subscription_id: checkout.subscription_id,
        dodo_customer_id: checkout.customer.customer_id,
        amount_pence: planConfig.amountPence,
        currency: planConfig.currency,
        charity_percentage,
        selected_charity_id: charity_id,
      },
      { onConflict: "dodo_subscription_id" },
    );

    return NextResponse.json({ url: checkout.payment_link });
  } catch (err: any) {
    console.error("[create-checkout]", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 },
    );
  }
}
