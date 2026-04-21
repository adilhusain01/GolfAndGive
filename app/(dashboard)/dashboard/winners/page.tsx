import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProofUpload } from "@/components/dashboard/proof-upload";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submit Proof" };

export default async function WinnersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pendingWinners } = await supabase
    .from("winners")
    .select("*, draws(draw_month)")
    .eq("user_id", user.id)
    .eq("payment_status", "pending");

  return <ProofUpload winners={pendingWinners ?? []} userId={user.id} />;
}
