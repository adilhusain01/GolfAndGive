import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProofUpload } from "@/components/dashboard/proof-upload";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submit Proof" };

export default async function WinnersPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pendingWinners } = await supabase
    .from("winners")
    .select("*, draws(draw_month)")
    .eq("user_id", user.id)
    .eq("payment_status", "pending");

  const winnersWithProofUrls = await Promise.all(
    (pendingWinners ?? []).map(async (winner) => {
      if (!winner.proof_url || winner.proof_url.startsWith("http")) {
        return winner;
      }

      const { data } = await adminSupabase.storage
        .from("winner-proofs")
        .createSignedUrl(winner.proof_url, 60 * 15);

      return {
        ...winner,
        proof_url: data?.signedUrl ?? null,
      };
    }),
  );

  return <ProofUpload winners={winnersWithProofUrls} />;
}
