import { createClient } from "@/lib/supabase/server";
import { WinnersManager } from "@/components/admin/winners-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Winners" };

export default async function AdminWinnersPage() {
  const supabase = await createClient();

  const { data: winners } = await supabase
    .from("winners")
    .select(`
      *,
      profiles (full_name, email),
      draws (draw_month)
    `)
    .order("created_at", { ascending: false });

  return <WinnersManager winners={winners ?? []} />;
}
