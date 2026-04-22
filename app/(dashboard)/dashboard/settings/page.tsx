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
    <div className="space-y-8 animate-fade-in">
      <div className="max-w-3xl">
        <p className="section-label">Account Control</p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Keep your member details current, update your photo, and review the subscription
          record that controls billing and access.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ProfileSettings profile={profile} />
        <SubscriptionSettings subscription={subscription} />
      </div>
    </div>
  );
}
