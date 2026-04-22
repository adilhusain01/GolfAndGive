import DodoPayments from "dodopayments";

const dodoEnvironment =
  process.env.DODO_ENVIRONMENT === "live_mode" ||
  process.env.DODO_ENVIRONMENT === "test_mode"
    ? process.env.DODO_ENVIRONMENT
    : process.env.NODE_ENV === "production"
      ? "live_mode"
      : "test_mode";

// Singleton client — re-used across invocations in the same warm lambda
const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: dodoEnvironment,
});

export default dodo;
export { dodoEnvironment };

// ─── Plan config ──────────────────────────────────────────────
export const PLANS = {
  monthly: {
    productId:  process.env.DODO_MONTHLY_PRODUCT_ID!,
    label:      "Monthly",
    amountPence: 49900,    // ₹499 in paise
    currency:   "INR",
  },
  yearly: {
    productId:  process.env.DODO_YEARLY_PRODUCT_ID!,
    label:      "Yearly",
    amountPence: 479900,   // ₹4,799 in paise (save ~20%)
    currency:   "INR",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ─── Prize pool helpers ───────────────────────────────────────
/**
 * Given the total prize pool (after charity + platform cut),
 * return each tier's share.
 */
export function splitPrizePool(totalPool: number) {
  return {
    jackpot:  +(totalPool * 0.40).toFixed(2),
    match4:   +(totalPool * 0.35).toFixed(2),
    match3:   +(totalPool * 0.25).toFixed(2),
  };
}

/**
 * Calculate how much of a subscription goes to:
 *  - charity     → charityPercent %
 *  - platform    → 10 %
 *  - prize pool  → remainder
 */
export function splitSubscription(amountPence: number, charityPercent: number) {
  const total    = amountPence / 100;
  const charity  = +(total * (charityPercent / 100)).toFixed(2);
  const platform = +(total * 0.10).toFixed(2);
  const pool     = +(total - charity - platform).toFixed(2);
  return { charity, platform, pool, total };
}
