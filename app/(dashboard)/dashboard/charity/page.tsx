import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CharitySettings } from "@/components/dashboard/charity-settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Charity" };

export default async function DashboardCharityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subscription }, { data: charities }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, selected_charity_id, charity_percentage, charities(id, name, slug, logo_url)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single(),
    supabase
      .from("charities")
      .select("id, name, description, logo_url")
      .eq("is_active", true),
  ]);

  return <CharitySettings subscription={subscription} charities={charities ?? []} />;
}
