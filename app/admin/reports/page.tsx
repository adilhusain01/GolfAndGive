import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "@/components/admin/reports-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Reports" };

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const [
    { data: contributions },
    { data: draws },
    { data: subsGrowth },
  ] = await Promise.all([
    supabase
      .from("charity_contributions")
      .select("amount, charity_id, created_at, charities(name)")
      .order("created_at"),
    supabase
      .from("draws")
      .select("draw_month, jackpot_amount, pool_4match, pool_3match, status")
      .eq("status", "published")
      .order("draw_month"),
    supabase
      .from("subscriptions")
      .select("created_at, plan, status")
      .order("created_at"),
  ]);

  return (
    <ReportsClient
      contributions={contributions ?? []}
      draws={draws ?? []}
      subsGrowth={subsGrowth ?? []}
    />
  );
}
