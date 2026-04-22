export const PLANS = {
  monthly: {
    label: "Monthly",
    amountPence: 49900,
    currency: "INR",
  },
  yearly: {
    label: "Yearly",
    amountPence: 479900,
    currency: "INR",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function splitPrizePool(totalPool: number) {
  return {
    jackpot: +(totalPool * 0.4).toFixed(2),
    match4: +(totalPool * 0.35).toFixed(2),
    match3: +(totalPool * 0.25).toFixed(2),
  };
}

export function splitSubscription(amountPence: number, charityPercent: number) {
  const total = amountPence / 100;
  const charity = +(total * (charityPercent / 100)).toFixed(2);
  const platform = +(total * 0.1).toFixed(2);
  const pool = +(total - charity - platform).toFixed(2);
  return { charity, platform, pool, total };
}
