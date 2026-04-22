import { NextResponse, type NextRequest } from "next/server";
import dodo from "@/lib/dodo/client";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { donationCreateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const parsed = donationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { charity_id, donor_name, donor_email, amount_pence, message } =
      parsed.data;

    if (!process.env.DODO_DONATION_PRODUCT_ID) {
      return NextResponse.json(
        { error: "DODO_DONATION_PRODUCT_ID is not configured." },
        { status: 500 },
      );
    }

    const { data: charity } = await adminSupabase
      .from("charities")
      .select("id, slug, name, is_active")
      .eq("id", charity_id)
      .maybeSingle();

    if (!charity?.is_active) {
      return NextResponse.json(
        { error: "This charity is not accepting donations right now." },
        { status: 404 },
      );
    }

    const payment = await dodo.payments.create({
      billing: {
        city: "Mumbai",
        country: "IN",
        state: "MH",
        street: "N/A",
        zipcode: "400001",
      },
      customer: {
        email: donor_email,
        name: donor_name,
      },
      product_cart: [
        {
          product_id: process.env.DODO_DONATION_PRODUCT_ID,
          quantity: 1,
          amount: amount_pence,
        },
      ],
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charity.slug}?donation=success`,
      metadata: {
        kind: "donation",
        charity_id,
        charity_slug: charity.slug,
        donor_name,
        donor_email,
        donor_user_id: user?.id ?? "",
        message: message ?? "",
      },
    });

    if (!payment.payment_link) {
      return NextResponse.json(
        { error: "Donation checkout link could not be created." },
        { status: 502 },
      );
    }

    await (adminSupabase.from("donations") as any).upsert(
      {
        user_id: user?.id ?? null,
        charity_id,
        donor_name,
        donor_email,
        amount_pence,
        currency: "INR",
        status: "pending",
        dodo_payment_id: payment.payment_id,
        dodo_customer_id: payment.customer.customer_id,
        message: message || null,
      },
      { onConflict: "dodo_payment_id" },
    );

    return NextResponse.json({ url: payment.payment_link });
  } catch (error: any) {
    console.error("[donation-checkout]", error);
    return NextResponse.json(
      { error: error.message ?? "Donation checkout failed" },
      { status: 500 },
    );
  }
}
