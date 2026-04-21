import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dodo, { PLANS } from "@/lib/dodo/client";
import { subscriptionCreateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body   = await req.json();
    const parsed = subscriptionCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { plan, charityId, charityPercentage } = parsed.data;
    const planConfig = PLANS[plan];

    // Get or fetch profile for customer name/email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Create a DodoPayments payment link / checkout session
    // Dodo uses product_id + quantity model for subscriptions
    const checkout = await dodo.payments.create({
      billing: {
        city:    "Mumbai",
        country: "IN",
        state:   "MH",
        street:  "N/A",
        zipcode: "400001",
      },
      customer: {
        email: profile?.email ?? user.email!,
        name:  profile?.full_name ?? "Subscriber",
      },
      product_id:  planConfig.productId,
      quantity:    1,
      payment_link: true,
      return_url:  `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/success?plan=${plan}&charity=${charityId}&pct=${charityPercentage}`,
      metadata: {
        user_id:            user.id,
        plan,
        charity_id:         charityId,
        charity_percentage: String(charityPercentage),
      },
    });

    return NextResponse.json({ url: (checkout as any).payment_link });
  } catch (err: any) {
    console.error("[create-checkout]", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
