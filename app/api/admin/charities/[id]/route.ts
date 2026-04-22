import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { charitySchema } from "@/lib/validations";

async function requireAdmin() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorised" }, { status: 401 }),
    };
  }

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as {
    data: { role?: string | null } | null;
  };

  if (profile?.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { adminSupabase };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const body = await req.json();
  const parsed = charitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data, error } = await (auth.adminSupabase.from("charities") as any)
    .update(parsed.data)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ charity: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const [{ count: subscriptionRefs }, { count: contributionRefs }] =
    await Promise.all([
      auth.adminSupabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("selected_charity_id", params.id),
      auth.adminSupabase
        .from("charity_contributions")
        .select("id", { count: "exact", head: true })
        .eq("charity_id", params.id),
    ]);

  if ((subscriptionRefs ?? 0) > 0 || (contributionRefs ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "This charity is already referenced by subscriptions or contribution records and cannot be deleted.",
      },
      { status: 409 },
    );
  }

  const { error } = await (auth.adminSupabase.from("charities") as any)
    .delete()
    .eq("id", params.id);

  if (error) {
    const status = error.code === "23503" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ success: true });
}
