import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { countMatches, getPrizeTier, calculatePrizes } from "@/lib/draw-engine";
import { drawPublishSchema } from "@/lib/validations";

// POST /api/admin/draws/:id/publish
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase      = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const drawId = params.id;
  const body   = await req.json();
  const parsed = drawPublishSchema.safeParse({ draw_id: drawId, ...body });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { winning_numbers } = parsed.data;

  // Fetch draw
  const { data: draw } = await adminSupabase.from("draws").select("*").eq("id", drawId).single();
  if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  if (draw.status === "published") return NextResponse.json({ error: "Draw already published" }, { status: 409 });

  // Get all active subscribers' scores at draw time
  const { data: activeSubs } = await adminSupabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");

  const userIds = activeSubs?.map((s: any) => s.user_id) ?? [];

  // For each user, get their 5 latest scores
  const { data: scoreRows } = await adminSupabase
    .from("golf_scores")
    .select("user_id, score")
    .in("user_id", userIds)
    .order("score_date", { ascending: false });

  // Build user → numbers map (top 5 scores)
  const userScores: Record<string, number[]> = {};
  for (const row of scoreRows ?? []) {
    if (!userScores[row.user_id]) userScores[row.user_id] = [];
    if (userScores[row.user_id].length < 5) {
      userScores[row.user_id].push(row.score);
    }
  }

  // Create draw entries and determine winners
  const entries = [];
  const winnerRows: any[] = [];

  for (const userId of userIds) {
    const nums    = userScores[userId] ?? [];
    const matches = countMatches(nums, winning_numbers);
    const tier    = getPrizeTier(matches);

    entries.push({
      draw_id:     drawId,
      user_id:     userId,
      numbers:     nums,
      match_count: matches,
      prize_tier:  tier,
    });
  }

  // Upsert entries
  const { data: insertedEntries } = await adminSupabase
    .from("draw_entries")
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
    Object.entries(tierCounts).map(([tier, count]) => ({ tier, count: count as number }))
  );

  const prizeMap: Record<string, number> = {};
  for (const p of prizes) prizeMap[p.tier] = p.perWinner;

  // Jackpot rollover check
  const jackpotRolled = prizes.find((p) => p.tier === "5-match")?.jackpotRolled ?? false;

  // Insert winner rows
  for (const entry of (insertedEntries ?? []) as any[]) {
    if (!entry.prize_tier) continue;
    const prizeAmt = prizeMap[entry.prize_tier] ?? 0;
    if (prizeAmt <= 0) continue;

    winnerRows.push({
      draw_id:       drawId,
      user_id:       entry.user_id,
      draw_entry_id: entry.id,
      prize_tier:    entry.prize_tier,
      prize_amount:  prizeAmt,
      payment_status: "pending",
    });
  }

  if (winnerRows.length > 0) {
    await adminSupabase.from("winners").insert(winnerRows);
  }

  // If jackpot rolled, carry forward to next draw
  // (handled when next draw is created; just flag it)

  // Mark draw published
  await adminSupabase.from("draws").update({
    status:          "published",
    winning_numbers,
    jackpot_rolled:  jackpotRolled,
    published_at:    new Date().toISOString(),
  }).eq("id", drawId);

  return NextResponse.json({
    winners:       winnerRows.length,
    jackpotRolled,
    prizes,
  });
}
