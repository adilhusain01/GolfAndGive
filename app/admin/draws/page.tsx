import { createClient } from "@/lib/supabase/server";
import { DrawManager } from "@/components/admin/draw-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Draw Management" };

export default async function AdminDrawsPage() {
  const supabase = await createClient();

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("draw_month", { ascending: false })
    .limit(12);

  const { data: activeSubscribers } = await supabase
    .from("subscriptions")
    .select("user_id, amount_pence, charity_percentage")
    .eq("status", "active");

  return <DrawManager draws={draws ?? []} activeSubscribers={activeSubscribers ?? []} />;
}
