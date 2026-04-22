import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Proof file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 },
    );
  }

  const { data: winner } = await supabase
    .from("winners")
    .select("id, payment_status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!winner) {
    return NextResponse.json({ error: "Winner not found" }, { status: 404 });
  }

  if (winner.payment_status !== "pending") {
    return NextResponse.json(
      { error: "Proof can only be submitted for pending winners" },
      { status: 409 },
    );
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${user.id}/${params.id}.${ext}`;

  const { error: uploadError } = await adminSupabase.storage
    .from("winner-proofs")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await (adminSupabase.from("winners") as any)
    .update({ proof_url: path })
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
