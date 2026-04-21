import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/dashboard/profile-settings";
import { SubscriptionSettings } from "@/components/dashboard/subscription-settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and subscription.</p>
      </div>
      <ProfileSettings profile={profile} />
      <SubscriptionSettings subscription={subscription} />
    </div>
  );
}
