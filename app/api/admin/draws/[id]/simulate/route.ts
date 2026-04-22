import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { randomDraw, algorithmicDraw } from "@/lib/draw-engine";

// POST /api/admin/draws/:id/simulate
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

  // Admin check
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

  const { data: draw } = (await adminSupabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single()) as {
    data: { logic?: string | null } | null;
  };
  if (!draw)
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });

  // Gather all active subscriber scores for algorithmic draw
  let numbers: number[];

  if (draw.logic === "algorithmic") {
    const { data: entries } = await adminSupabase
      .from("golf_scores")
      .select("score")
      .in(
        "user_id",
        (
          await adminSupabase
            .from("subscriptions")
            .select("user_id")
            .eq("status", "active")
        ).data?.map((s: any) => s.user_id) ?? [],
      );
    const allScores = entries?.map((e: any) => e.score) ?? [];
    numbers = algorithmicDraw(allScores);
  } else {
    numbers = randomDraw();
  }

  // Update draw to simulation state
  await (adminSupabase.from("draws") as any)
    .update({ status: "simulation", winning_numbers: numbers })
    .eq("id", drawId);

  return NextResponse.json({ numbers });
}
