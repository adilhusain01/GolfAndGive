import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { countMatches, getPrizeTier, calculatePrizes } from "@/lib/draw-engine";
import { drawPublishSchema } from "@/lib/validations";

// POST /api/admin/draws/:id/publish
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as {
    data: { role?: string | null } | null;
  };
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const drawId = params.id;
  const body = await req.json();
  const parsed = drawPublishSchema.safeParse({ draw_id: drawId, ...body });
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { winning_numbers } = parsed.data;

  // Fetch draw
  const { data: draw } = (await adminSupabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single()) as {
    data: {
      status?: string | null;
      jackpot_amount?: number | string | null;
      pool_4match?: number | string | null;
      pool_3match?: number | string | null;
    } | null;
  };
  if (!draw)
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  if (draw.status === "published")
    return NextResponse.json(
      { error: "Draw already published" },
      { status: 409 },
    );

  // Get all active subscribers' scores at draw time
  const { data: activeSubs } = (await adminSupabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active")) as { data: { user_id?: string | null }[] | null };

  const userIds = activeSubs?.map((s) => s.user_id).filter(Boolean) as string[];

  // For each user, get their 5 latest scores
  const { data: scoreRows } = (await adminSupabase
    .from("golf_scores")
    .select("user_id, score")
    .in("user_id", userIds)
    .order("score_date", { ascending: false })) as {
    data: { user_id?: string | null; score?: number | null }[] | null;
  };

  // Build user → numbers map (top 5 scores)
  const userScores: Record<string, number[]> = {};
  for (const row of scoreRows ?? []) {
    const userId = row.user_id;
    if (!userId) continue;
    if (!userScores[userId]) userScores[userId] = [];
    if (userScores[userId].length < 5) {
      userScores[userId].push(row.score ?? 0);
    }
  }

  // Create draw entries and determine winners
  type DrawEntryInsert = {
    draw_id: string;
    user_id: string;
    numbers: number[];
    match_count: number;
    prize_tier: string | null;
  };

  const entries: DrawEntryInsert[] = [];
  const winnerRows: any[] = [];
  const eligibleUserIds = userIds.filter((userId) => (userScores[userId] ?? []).length === 5);

  for (const userId of eligibleUserIds) {
    const nums = userScores[userId] ?? [];
    const matches = countMatches(nums, winning_numbers);
    const tier = getPrizeTier(matches);

    entries.push({
      draw_id: drawId,
      user_id: userId,
      numbers: nums,
      match_count: matches,
      prize_tier: tier,
    });
  }

  // Upsert entries
  const { data: insertedEntries } = await (
    adminSupabase.from("draw_entries") as any
  )
    .upsert(entries, { onConflict: "draw_id,user_id" })
    .select();

  // Count winners per tier
  const tierCounts = (insertedEntries ?? []).reduce((acc: any, e: any) => {
    if (e.prize_tier) acc[e.prize_tier] = (acc[e.prize_tier] ?? 0) + 1;
    return acc;
  }, {});

  const prizes = calculatePrizes(
    Number(draw.jackpot_amount),
    Number(draw.pool_4match),
    Number(draw.pool_3match),
    Object.entries(tierCounts).map(([tier, count]) => ({
      tier,
      count: count as number,
    })),
  );

  const prizeMap: Record<string, number> = {};
  for (const p of prizes) prizeMap[p.tier] = p.perWinner;

  // Jackpot rollover check
  const jackpotRolled =
    prizes.find((p) => p.tier === "5-match")?.jackpotRolled ?? false;

  // Insert winner rows
  for (const entry of (insertedEntries ?? []) as any[]) {
    if (!entry.prize_tier) continue;
    const prizeAmt = prizeMap[entry.prize_tier] ?? 0;
    if (prizeAmt <= 0) continue;

    winnerRows.push({
      draw_id: drawId,
      user_id: entry.user_id,
      draw_entry_id: entry.id,
      prize_tier: entry.prize_tier,
      prize_amount: prizeAmt,
      payment_status: "pending",
    });
  }

  if (winnerRows.length > 0) {
    await (adminSupabase.from("winners") as any).insert(winnerRows);
  }

  // If jackpot rolled, carry forward to next draw
  // (handled when next draw is created; just flag it)

  // Mark draw published
  await (adminSupabase.from("draws") as any)
    .update({
      status: "published",
      winning_numbers,
      jackpot_rolled: jackpotRolled,
      published_at: new Date().toISOString(),
    })
    .eq("id", drawId);

  return NextResponse.json({
    winners: winnerRows.length,
    jackpotRolled,
    prizes,
  });
}
