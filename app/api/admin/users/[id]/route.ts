import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRoute } from "@/lib/admin";
import { adminUserUpdateSchema } from "@/lib/validations";

async function getManagedUser(adminSupabase: any, userId: string) {
  const [{ data: profile }, { data: subscription }, { data: scores }] =
    await Promise.all([
      adminSupabase
        .from("profiles")
        .select("id, full_name, email, role, phone, country, created_at")
        .eq("id", userId)
        .maybeSingle(),
      adminSupabase
        .from("subscriptions")
        .select(
          "id, plan, status, charity_percentage, selected_charity_id, current_period_end, amount_pence, currency, dodo_subscription_id, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminSupabase
        .from("golf_scores")
        .select("id, score, score_date, created_at")
        .eq("user_id", userId)
        .order("score_date", { ascending: false })
        .limit(5),
    ]);

  return {
    profile,
    subscription,
    scores: scores ?? [],
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminRoute();
  if ("error" in auth) {
    return auth.error;
  }

  const managedUser = await getManagedUser(auth.adminSupabase, params.id);
  if (!managedUser.profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: managedUser.profile,
    subscription: managedUser.subscription,
    scores: managedUser.scores,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminRoute();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await req.json();
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (
    auth.actingUserId === params.id &&
    parsed.data.role !== "admin"
  ) {
    return NextResponse.json(
      { error: "You cannot remove your own admin access." },
      { status: 400 },
    );
  }

  const updateData = {
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    phone: parsed.data.phone || null,
    country: parsed.data.country || "IN",
  };

  const { data, error } = await (auth.adminSupabase.from("profiles") as any)
    .update(updateData)
    .eq("id", params.id)
    .select("id, full_name, email, role, phone, country, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const managedUser = await getManagedUser(auth.adminSupabase, params.id);

  return NextResponse.json({
    user: data,
    subscription: managedUser.subscription,
    scores: managedUser.scores,
  });
}
