import { createClient } from "@/lib/supabase/server";
import { UsersManager } from "@/components/admin/users-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const [{ data: users }, { data: subscriptions }, { data: charities }] =
    await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("user_id, plan, status, current_period_end, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("charities")
      .select("id, name, is_active")
      .order("name"),
    ]);

  const latestSubscriptionByUser = new Map<
    string,
    {
      plan?: string | null;
      status?: string | null;
      current_period_end?: string | null;
    }
  >();

  for (const subscription of subscriptions ?? []) {
    if (!subscription.user_id || latestSubscriptionByUser.has(subscription.user_id)) {
      continue;
    }

    latestSubscriptionByUser.set(subscription.user_id, {
      plan: subscription.plan,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    });
  }

  const rows = (users ?? []).map((user) => ({
    ...user,
    subscription: latestSubscriptionByUser.get(user.id) ?? null,
  }));

  return <UsersManager users={rows} charities={charities ?? []} />;
}
