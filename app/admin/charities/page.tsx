import { createClient } from "@/lib/supabase/server";
import { CharitiesManager } from "@/components/admin/charities-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Charities" };

export default async function AdminCharitiesPage() {
  const supabase = await createClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("created_at", { ascending: false });

  return <CharitiesManager charities={charities ?? []} />;
}
