import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRoute } from "@/lib/admin";
import { scoreSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminRoute();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await req.json();
  const parsed = scoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data, error } = await (auth.adminSupabase.from("golf_scores") as any)
    .insert({
      user_id: params.id,
      score: parsed.data.score,
      score_date: parsed.data.score_date,
    })
    .select("id, score, score_date, created_at")
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ score: data });
}
