import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { splitSubscription } from "@/lib/dodo/client";
import {
  safelySendEmail,
  sendDonationReceiptEmail,
  sendSubscriptionActivatedEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionRenewedEmail,
} from "@/lib/notifications";

function getWebhookSecret() {
  return (
    process.env.DODO_WEBHOOK_SECRET ??
    process.env.DODO_PAYMENTS_WEBHOOK_KEY ??
    ""
  );
}

function getWebhookSecretBytes(secret: string) {
  if (secret.startsWith("whsec_")) {
    return Buffer.from(secret.slice("whsec_".length), "base64");
  }

  return Buffer.from(secret, "utf8");
}

function parseWebhookSignatures(signatureHeader: string) {
  return signatureHeader
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [version, signature] = part.split(",", 2);
      return { version, signature };
    })
    .filter(
      (entry): entry is { version: string; signature: string } =>
        !!entry.version && !!entry.signature,
    );
}

function verifyWebhookSignature({
  rawBody,
  secret,
  webhookId,
  webhookTimestamp,
  webhookSignature,
}: {
  rawBody: string;
  secret: string;
  webhookId: string;
  webhookTimestamp: string;
  webhookSignature: string;
}) {
  if (!secret || !webhookId || !webhookTimestamp || !webhookSignature) {
    return false;
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expectedSignature = createHmac("sha256", getWebhookSecretBytes(secret))
    .update(signedContent)
    .digest("base64");

  return parseWebhookSignatures(webhookSignature)
    .filter((entry) => entry.version === "v1")
    .some((entry) => {
      const actual = Buffer.from(entry.signature);
      const expected = Buffer.from(expectedSignature);

      return (
        actual.length === expected.length &&
        timingSafeEqual(actual, expected)
      );
    });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookId = req.headers.get("webhook-id") ?? "";
  const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = req.headers.get("webhook-signature") ?? "";
  const secret = getWebhookSecret();

  const valid = verifyWebhookSignature({
    rawBody,
    secret,
    webhookId,
    webhookTimestamp,
    webhookSignature,
  });

  if (!valid) {
    console.warn("[webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminClient();
  const payload = {
    ...event,
    webhook_meta: {
      webhook_id: webhookId,
      webhook_timestamp: webhookTimestamp,
    },
  };

  const { data: existingEvent } = await (supabase.from("payment_events") as any)
    .select("id, processed")
    .eq("provider", "dodopayments")
    .contains("payload", {
      webhook_meta: {
        webhook_id: webhookId,
      },
    })
    .maybeSingle();

  if (existingEvent?.processed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Log raw event
  const paymentEventId =
    existingEvent?.id ??
    (
      await (supabase.from("payment_events") as any)
        .insert({
          event_type: event.type,
          payload,
          user_id: event.data?.metadata?.user_id ?? null,
        })
        .select("id")
        .single()
    ).data?.id;

  try {
    switch (event.type) {
      // ── Payment succeeded — activate subscription ──────────
      case "payment.succeeded": {
        const meta = event.data?.metadata ?? {};
        if (meta.kind === "donation") {
          const charityId = meta.charity_id;
          const paymentId = event.data?.payment_id;
          const amountPence = Number(event.data?.total_amount ?? 0);
          const donorEmail = meta.donor_email ?? event.data?.customer?.email;
          const donorName = meta.donor_name ?? event.data?.customer?.name;

          const [{ data: charity }, { data: donation }] = await Promise.all([
            charityId
              ? supabase
                  .from("charities")
                  .select("name")
                  .eq("id", charityId)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            paymentId
              ? supabase
                  .from("donations")
                  .select("id")
                  .eq("dodo_payment_id", paymentId)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          if (paymentId) {
            if (donation?.id) {
              await (supabase.from("donations") as any)
                .update({
                  status: "succeeded",
                  amount_pence: amountPence,
                  currency: event.data?.currency ?? "INR",
                })
                .eq("id", donation.id);
            } else {
              await (supabase.from("donations") as any).insert({
                user_id: meta.donor_user_id || null,
                charity_id: charityId,
                donor_name: donorName ?? "Donor",
                donor_email: donorEmail,
                amount_pence: amountPence,
                currency: event.data?.currency ?? "INR",
                status: "succeeded",
                dodo_payment_id: paymentId,
                dodo_customer_id: event.data?.customer?.customer_id ?? null,
                message: meta.message || null,
              });
            }
          }

          if (donorEmail && charity?.name) {
            await safelySendEmail("donation receipt", () =>
              sendDonationReceiptEmail({
                to: donorEmail,
                donorName,
                charityName: charity.name,
                amountPence,
              }),
            );
          }

          break;
        }

        const userId = meta.user_id;
        if (!userId) break;

        const plan = meta.plan ?? "monthly";
        const charityId = meta.charity_id;
        const charityPercentage = parseInt(meta.charity_percentage ?? "10", 10);
        const amountPence = Number(event.data?.total_amount ?? 0);
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
              dodo_customer_id: event.data?.customer?.customer_id ?? null,
              amount_pence: amountPence,
              currency: event.data?.currency ?? "INR",
              charity_percentage: charityPercentage,
              selected_charity_id: charityId,
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
            },
            { onConflict: "dodo_subscription_id" },
          )
          .select()
          .single();

        const [{ data: profile }, { data: charity }] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", userId)
            .maybeSingle(),
          charityId
            ? supabase
                .from("charities")
                .select("name")
                .eq("id", charityId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        // Record charity contribution
        if (sub && charityId) {
          const split = splitSubscription(amountPence, charityPercentage);
          await (supabase.from("charity_contributions") as any).insert({
            user_id: userId,
            charity_id: charityId,
            subscription_id: sub.id,
            amount: split.charity,
            currency: event.data?.currency ?? "INR",
            period_start: now.toISOString(),
            period_end: periodEnd.toISOString(),
          });
        }

        if (profile?.email) {
          await safelySendEmail("subscription activated", () =>
            sendSubscriptionActivatedEmail({
              to: profile.email,
              fullName: profile.full_name,
              plan,
              amountPence,
              charityName: charity?.name,
            }),
          );
        }

        break;
      }

      // ── Subscription cancelled ─────────────────────────────
      case "subscription.cancelled":
      case "subscription.ended": {
        const subId = event.data?.id ?? event.data?.subscription_id;
        if (subId) {
          const { data: cancelledSubscription } = await (supabase.from(
            "subscriptions",
          ) as any)
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
            })
            .eq("dodo_subscription_id", subId);

          const userId = event.data?.metadata?.user_id;
          if (userId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", userId)
              .maybeSingle();

            if (profile?.email) {
              await safelySendEmail("subscription cancelled", () =>
                sendSubscriptionCancelledEmail({
                  to: profile.email,
                  fullName: profile.full_name,
                  currentPeriodEnd:
                    cancelledSubscription?.[0]?.current_period_end ??
                    event.data?.next_billing_date ??
                    null,
                }),
              );
            }
          }
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
              current_period_end:
                event.data?.next_billing_date ?? periodEnd.toISOString(),
            })
            .eq("dodo_subscription_id", subId)
            .select()
            .single();

          // Initial subscription payments are recorded on payment.succeeded.
          if (event.type === "subscription.renewed" && sub && userId) {
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
                currency: sub.currency,
                period_start: now.toISOString(),
                period_end:
                  event.data?.next_billing_date ?? periodEnd.toISOString(),
              });
            }
          }

          if (sub && userId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", userId)
              .maybeSingle();

            if (profile?.email) {
              await safelySendEmail("subscription renewed", () =>
                sendSubscriptionRenewedEmail({
                  to: profile.email,
                  fullName: profile.full_name,
                  plan,
                  amountPence: sub.amount_pence,
                  nextBillingDate:
                    event.data?.next_billing_date ?? sub.current_period_end,
                }),
              );
            }
          }
        }
        break;
      }
    }

    if (paymentEventId) {
      await (supabase.from("payment_events") as any)
        .update({ processed: true, payload })
        .eq("id", paymentEventId);
    }
  } catch (err) {
    console.error("[webhook] processing error", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
