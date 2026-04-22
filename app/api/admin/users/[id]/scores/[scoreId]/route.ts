import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRoute } from "@/lib/admin";
import { scoreSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; scoreId: string } },
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
    .update({
      score: parsed.data.score,
      score_date: parsed.data.score_date,
    })
    .eq("id", params.scoreId)
    .eq("user_id", params.id)
    .select("id, score, score_date, created_at")
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ score: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; scoreId: string } },
) {
  const auth = await requireAdminRoute();
  if ("error" in auth) {
    return auth.error;
  }

  const { error } = await (auth.adminSupabase.from("golf_scores") as any)
    .delete()
    .eq("id", params.scoreId)
    .eq("user_id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
