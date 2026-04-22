import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { splitSubscription } from "@/lib/dodo/client";

// DodoPayments sends a raw-body HMAC-SHA256 signature
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("webhook-signature") ?? "";
  const secret = process.env.DODO_WEBHOOK_SECRET!;

  // Verify signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const data = encoder.encode(rawBody);
  const sigBuf = Buffer.from(sig, "hex");
  const valid = await crypto.subtle.verify("HMAC", key, sigBuf, data);

  if (!valid) {
    console.warn("[webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminClient();

  // Log raw event
  const { data: paymentEvent } = await (supabase.from("payment_events") as any)
    .insert({
      event_type: event.type,
      payload: event,
      user_id: event.data?.metadata?.user_id ?? null,
    })
    .select("id")
    .single();

  try {
    switch (event.type) {
      // ── Payment succeeded — activate subscription ──────────
      case "payment.succeeded": {
        const meta = event.data?.metadata ?? {};
        const userId = meta.user_id;
        if (!userId) break;

        const plan = meta.plan ?? "monthly";
        const charityId = meta.charity_id;
        const charityPercentage = parseInt(meta.charity_percentage ?? "10", 10);
        const amountPence = event.data?.amount ?? 0;
        const dodoSubscriptionId =
          event.data?.subscription_id ?? event.data?.payment_id;
        if (!dodoSubscriptionId) break;

        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + (plan === "yearly" ? 12 : 1));

        const { data: sub } = await (supabase.from("subscriptions") as any)
          .upsert(
            {
              user_id: userId,
              plan,
              status: "active",
              dodo_subscription_id: dodoSubscriptionId,
              dodo_customer_id: event.data?.customer_id,
              amount_pence: amountPence,
              charity_percentage: charityPercentage,
              selected_charity_id: charityId,
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
            },
            { onConflict: "dodo_subscription_id" },
          )
          .select()
          .single();

        // Record charity contribution
        if (sub && charityId) {
          const split = splitSubscription(amountPence, charityPercentage);
          await (supabase.from("charity_contributions") as any).insert({
            user_id: userId,
            charity_id: charityId,
            subscription_id: sub.id,
            amount: split.charity,
            currency: "INR",
            period_start: now.toISOString(),
            period_end: periodEnd.toISOString(),
          });
        }

        // Mark event processed
        if (paymentEvent?.id) {
          await (supabase.from("payment_events") as any)
            .update({ processed: true })
            .eq("id", paymentEvent.id);
        }

        break;
      }

      // ── Subscription cancelled ─────────────────────────────
      case "subscription.cancelled":
      case "subscription.ended": {
        const subId = event.data?.id ?? event.data?.subscription_id;
        if (subId) {
          await (supabase.from("subscriptions") as any)
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
            })
            .eq("dodo_subscription_id", subId);
        }
        break;
      }

      // ── Subscription renewed ──────────────────────────────
      case "subscription.renewed":
      case "subscription.active": {
        const subId = event.data?.id ?? event.data?.subscription_id;
        const userId = event.data?.metadata?.user_id;
        if (subId) {
          const now = new Date();
          const plan = event.data?.metadata?.plan ?? "monthly";
          const periodEnd = new Date(now);
          periodEnd.setMonth(
            periodEnd.getMonth() + (plan === "yearly" ? 12 : 1),
          );

          const { data: sub } = await (supabase.from("subscriptions") as any)
            .update({
              status: "active",
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
            .eq("dodo_subscription_id", subId)
            .select()
            .single();

          // Record renewal charity contribution
          if (sub && userId) {
            const amountPence = event.data?.amount ?? sub.amount_pence;
            const split = splitSubscription(
              amountPence,
              sub.charity_percentage,
            );
            if (sub.selected_charity_id) {
              await (supabase.from("charity_contributions") as any).insert({
                user_id: userId,
                charity_id: sub.selected_charity_id,
                subscription_id: sub.id,
                amount: split.charity,
                currency: "INR",
                period_start: now.toISOString(),
                period_end: periodEnd.toISOString(),
              });
            }
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] processing error", err);
  }

  return NextResponse.json({ received: true });
}
