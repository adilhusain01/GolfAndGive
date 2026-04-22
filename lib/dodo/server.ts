import "server-only";

import DodoPayments from "dodopayments";
import { PLANS, type PlanKey } from "@/lib/dodo/client";

export const dodoEnvironment =
  process.env.DODO_ENVIRONMENT === "live_mode" ||
  process.env.DODO_ENVIRONMENT === "test_mode"
    ? process.env.DODO_ENVIRONMENT
    : process.env.NODE_ENV === "production"
      ? "live_mode"
      : "test_mode";

const dodoApiKey =
  process.env.DODO_API_KEY ?? process.env.DODO_PAYMENTS_API_KEY ?? "";

let dodoSingleton: DodoPayments | null = null;

export function getDodo() {
  if (!dodoApiKey) {
    throw new Error(
      "Missing Dodo API key. Set DODO_API_KEY or DODO_PAYMENTS_API_KEY in the server environment.",
    );
  }

  if (!dodoSingleton) {
    dodoSingleton = new DodoPayments({
      bearerToken: dodoApiKey,
      environment: dodoEnvironment,
    });
  }

  return dodoSingleton;
}

export const SERVER_PLANS: Record<
  PlanKey,
  (typeof PLANS)[PlanKey] & { productId: string }
> = {
  monthly: {
    ...PLANS.monthly,
    productId: process.env.DODO_MONTHLY_PRODUCT_ID ?? "",
  },
  yearly: {
    ...PLANS.yearly,
    productId: process.env.DODO_YEARLY_PRODUCT_ID ?? "",
  },
};
