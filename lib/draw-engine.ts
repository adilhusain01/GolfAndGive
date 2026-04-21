/**
 * Draw Engine — server-side only
 * Generates winning numbers and computes match tiers.
 */

/** Generate 5 unique random numbers in range [1, 45] */
export function randomDraw(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const result: number[] = [];
  while (result.length < 5) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
}

/**
 * Algorithmic draw — weighted toward LEAST frequent user scores
 * so the jackpot is harder to win (drives engagement).
 * @param allUserScores flat array of all user scores across entries
 */
export function algorithmicDraw(allUserScores: number[]): number[] {
  // Count frequency of each number 1-45
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;
  for (const s of allUserScores) freq[s] = (freq[s] ?? 0) + 1;

  // Inverse frequency weight — rarer = higher weight
  const maxFreq   = Math.max(...Object.values(freq)) + 1;
  const weights   = Object.entries(freq).map(([num, f]) => ({
    num: +num,
    weight: maxFreq - f,
  }));

  // Weighted random selection (no replacement)
  const result: number[] = [];
  const remaining = [...weights];

  while (result.length < 5) {
    const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < remaining.length; i++) {
      rand -= remaining[i].weight;
      if (rand <= 0) {
        result.push(remaining[i].num);
        remaining.splice(i, 1);
        break;
      }
    }
  }

  return result.sort((a, b) => a - b);
}

/**
 * Count how many of a user's scores appear in the winning numbers.
 */
export function countMatches(userNumbers: number[], winningNumbers: number[]): number {
  const winSet = new Set(winningNumbers);
  return userNumbers.filter((n) => winSet.has(n)).length;
}

/**
 * Determine prize tier from match count.
 */
export function getPrizeTier(matchCount: number): string | null {
  if (matchCount === 5) return "5-match";
  if (matchCount === 4) return "4-match";
  if (matchCount === 3) return "3-match";
  return null;
}

/**
 * Split prize pool among winners per tier.
 * Returns amount each winner in a tier receives.
 */
export function calculatePrizes(
  jackpotPool: number,
  match4Pool:  number,
  match3Pool:  number,
  winners: { tier: string; count: number }[]
) {
  const tierMap: Record<string, { pool: number; count: number }> = {
    "5-match": { pool: jackpotPool, count: 0 },
    "4-match": { pool: match4Pool,  count: 0 },
    "3-match": { pool: match3Pool,  count: 0 },
  };

  for (const { tier, count } of winners) {
    if (tierMap[tier]) tierMap[tier].count = count;
  }

  return Object.entries(tierMap).map(([tier, { pool, count }]) => ({
    tier,
    totalPool: pool,
    winners:   count,
    perWinner: count > 0 ? +(pool / count).toFixed(2) : 0,
    jackpotRolled: tier === "5-match" && count === 0,
  }));
}
