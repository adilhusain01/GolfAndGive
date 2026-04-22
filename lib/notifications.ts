import { formatCurrency, formatDate, getMonthLabel } from "@/lib/utils";

const RESEND_API_URL = "https://api.resend.com/emails";

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? "",
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Golf & Give",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function emailShell({
  title,
  intro,
  body,
  footer,
}: {
  title: string;
  intro: string;
  body: string;
  footer?: string;
}) {
  return `
    <div style="background:#f5f1e8;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e7ded0;border-radius:24px;overflow:hidden;box-shadow:0 16px 40px rgba(25,32,45,0.08);">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#143c34 0%,#214f45 100%);color:#f8f6ef;">
          <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.75;">Golf & Give</div>
          <h1 style="margin:14px 0 10px;font-size:28px;line-height:1.1;font-weight:700;">${escapeHtml(title)}</h1>
          <p style="margin:0;font-size:15px;line-height:1.7;opacity:0.9;">${escapeHtml(intro)}</p>
        </div>
        <div style="padding:28px 32px;font-size:15px;line-height:1.75;">
          ${body}
        </div>
        <div style="padding:18px 32px;border-top:1px solid #eee2cf;font-size:13px;line-height:1.7;color:#6b7280;">
          ${footer ?? "This message was sent by Golf & Give because it affects your account, draw participation, or payout status."}
        </div>
      </div>
    </div>
  `;
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const config = getEmailConfig();
  if (!config.apiKey || !config.from) {
    console.warn("[email] skipped - missing RESEND_API_KEY or EMAIL_FROM", {
      to,
      subject,
    });
    return { skipped: true as const };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Resend ${res.status}: ${errorText}`);
  }

  return res.json();
}

export async function sendSubscriptionActivatedEmail({
  to,
  fullName,
  plan,
  amountPence,
  charityName,
}: {
  to: string;
  fullName?: string | null;
  plan: "monthly" | "yearly";
  amountPence: number;
  charityName?: string | null;
}) {
  const amount = formatCurrency(amountPence);
  const subject = `${getEmailConfig().appName}: your ${plan} subscription is active`;
  const intro = `Your subscription is now active and your account has full access.`;
  const body = `
    <p>Hello ${escapeHtml(fullName || "there")},</p>
    <p>Your <strong>${escapeHtml(plan)}</strong> subscription is active. We recorded your payment of <strong>${escapeHtml(amount)}</strong>.</p>
    <p>${charityName ? `Your current charity selection is <strong>${escapeHtml(charityName)}</strong>.` : "Your charity contribution settings are now attached to your subscription."}</p>
    <p>You can now enter scores, participate in draws, and manage your charity contribution from your dashboard.</p>
  `;

  await sendEmail({
    to,
    subject,
    html: emailShell({ title: "Subscription activated", intro, body }),
    text: `Hello ${fullName || "there"}, your ${plan} subscription is active. Payment recorded: ${amount}.${charityName ? ` Charity: ${charityName}.` : ""}`,
  });
}

export async function sendSubscriptionRenewedEmail({
  to,
  fullName,
  plan,
  amountPence,
  nextBillingDate,
}: {
  to: string;
  fullName?: string | null;
  plan: "monthly" | "yearly";
  amountPence: number;
  nextBillingDate?: string | null;
}) {
  const amount = formatCurrency(amountPence);
  const nextBilling = nextBillingDate ? formatDate(nextBillingDate) : null;
  const subject = `${getEmailConfig().appName}: subscription renewed`;
  const body = `
    <p>Hello ${escapeHtml(fullName || "there")},</p>
    <p>Your <strong>${escapeHtml(plan)}</strong> subscription has renewed successfully for <strong>${escapeHtml(amount)}</strong>.</p>
    <p>${nextBilling ? `Your next billing date is <strong>${escapeHtml(nextBilling)}</strong>.` : "Your next billing date has been updated in your account."}</p>
  `;

  await sendEmail({
    to,
    subject,
    html: emailShell({
      title: "Subscription renewed",
      intro: "Your access remains active for the next billing cycle.",
      body,
    }),
    text: `Hello ${fullName || "there"}, your ${plan} subscription has renewed for ${amount}.${nextBilling ? ` Next billing date: ${nextBilling}.` : ""}`,
  });
}

export async function sendSubscriptionCancelledEmail({
  to,
  fullName,
  currentPeriodEnd,
}: {
  to: string;
  fullName?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const endText = currentPeriodEnd ? formatDate(currentPeriodEnd) : "the end of your current billing period";
  await sendEmail({
    to,
    subject: `${getEmailConfig().appName}: subscription cancellation confirmed`,
    html: emailShell({
      title: "Cancellation confirmed",
      intro: "Your subscription has been marked to stop at the end of the current period.",
      body: `
        <p>Hello ${escapeHtml(fullName || "there")},</p>
        <p>Your subscription has been cancelled. Access will continue until <strong>${escapeHtml(endText)}</strong>.</p>
        <p>You can still use the product and view your current charity settings until then.</p>
      `,
    }),
    text: `Hello ${fullName || "there"}, your subscription cancellation is confirmed. Access continues until ${endText}.`,
  });
}

export async function sendDrawResultEmail({
  to,
  fullName,
  drawMonth,
  winningNumbers,
}: {
  to: string;
  fullName?: string | null;
  drawMonth: string;
  winningNumbers: number[];
}) {
  const monthLabel = getMonthLabel(drawMonth);
  const numbers = winningNumbers.join(", ");
  await sendEmail({
    to,
    subject: `${getEmailConfig().appName}: ${monthLabel} draw results are live`,
    html: emailShell({
      title: "Draw results published",
      intro: `${monthLabel} results are now available in your dashboard.`,
      body: `
        <p>Hello ${escapeHtml(fullName || "there")},</p>
        <p>The <strong>${escapeHtml(monthLabel)}</strong> draw has been published.</p>
        <p>Winning numbers: <strong>${escapeHtml(numbers)}</strong></p>
        <p>Open your dashboard to review your entry and current winnings status.</p>
      `,
    }),
    text: `Hello ${fullName || "there"}, the ${monthLabel} draw has been published. Winning numbers: ${numbers}.`,
  });
}

export async function sendWinnerAlertEmail({
  to,
  fullName,
  drawMonth,
  prizeTier,
  prizeAmount,
}: {
  to: string;
  fullName?: string | null;
  drawMonth: string;
  prizeTier: string;
  prizeAmount: number;
}) {
  const monthLabel = getMonthLabel(drawMonth);
  const amount = `₹${Number(prizeAmount).toLocaleString("en-IN")}`;
  await sendEmail({
    to,
    subject: `${getEmailConfig().appName}: you won in the ${monthLabel} draw`,
    html: emailShell({
      title: "Winner alert",
      intro: "Your entry matched a prize tier in the latest draw.",
      body: `
        <p>Hello ${escapeHtml(fullName || "there")},</p>
        <p>You won the <strong>${escapeHtml(prizeTier)}</strong> tier in the <strong>${escapeHtml(monthLabel)}</strong> draw.</p>
        <p>Your current prize amount is <strong>${escapeHtml(amount)}</strong>.</p>
        <p>Please open the winners area in your dashboard and upload your verification proof so admin review can complete payout processing.</p>
      `,
    }),
    text: `Hello ${fullName || "there"}, you won the ${prizeTier} tier in the ${monthLabel} draw. Prize amount: ${amount}. Upload proof in your dashboard to continue payout processing.`,
  });
}

export async function sendWinnerReviewEmail({
  to,
  fullName,
  paymentStatus,
  drawMonth,
  prizeTier,
  adminNotes,
}: {
  to: string;
  fullName?: string | null;
  paymentStatus: "paid" | "rejected";
  drawMonth: string;
  prizeTier: string;
  adminNotes?: string | null;
}) {
  const approved = paymentStatus === "paid";
  const monthLabel = getMonthLabel(drawMonth);
  await sendEmail({
    to,
    subject: approved
      ? `${getEmailConfig().appName}: payout marked as paid`
      : `${getEmailConfig().appName}: winner proof review update`,
    html: emailShell({
      title: approved ? "Payout completed" : "Winner proof reviewed",
      intro: approved
        ? "Your payout has been marked as completed."
        : "Your proof submission was reviewed by the admin team.",
      body: `
        <p>Hello ${escapeHtml(fullName || "there")},</p>
        <p>Your <strong>${escapeHtml(prizeTier)}</strong> result for the <strong>${escapeHtml(monthLabel)}</strong> draw has been updated to <strong>${escapeHtml(paymentStatus)}</strong>.</p>
        ${adminNotes ? `<p>Admin notes: ${escapeHtml(adminNotes)}</p>` : ""}
        <p>${approved ? "You can review the payout state in your dashboard at any time." : "Please review the notes in your dashboard and resubmit proof later if needed."}</p>
      `,
    }),
    text: `Hello ${fullName || "there"}, your ${prizeTier} result for the ${monthLabel} draw is now ${paymentStatus}.${adminNotes ? ` Notes: ${adminNotes}` : ""}`,
  });
}

export async function sendDonationReceiptEmail({
  to,
  donorName,
  charityName,
  amountPence,
}: {
  to: string;
  donorName?: string | null;
  charityName: string;
  amountPence: number;
}) {
  const amount = formatCurrency(amountPence);
  await sendEmail({
    to,
    subject: `${getEmailConfig().appName}: donation receipt`,
    html: emailShell({
      title: "Donation received",
      intro: "Thank you for supporting a partner charity through Golf & Give.",
      body: `
        <p>Hello ${escapeHtml(donorName || "there")},</p>
        <p>We received your one-time donation of <strong>${escapeHtml(amount)}</strong> for <strong>${escapeHtml(charityName)}</strong>.</p>
        <p>This email is your confirmation that the payment completed successfully.</p>
      `,
    }),
    text: `Hello ${donorName || "there"}, we received your donation of ${amount} for ${charityName}.`,
  });
}

export async function safelySendEmail(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (error) {
    console.error(`[email] ${label}`, error);
  }
}
