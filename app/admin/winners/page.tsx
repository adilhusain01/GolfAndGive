import { createAdminClient, createClient } from "@/lib/supabase/server";
import { WinnersManager } from "@/components/admin/winners-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Winners" };

export default async function AdminWinnersPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: winners } = await supabase
    .from("winners")
    .select(`
      *,
      profiles (full_name, email),
      draws (draw_month)
    `)
    .order("created_at", { ascending: false });

  const winnersWithProofUrls = await Promise.all(
    (winners ?? []).map(async (winner) => {
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

  return <WinnersManager winners={winnersWithProofUrls} />;
}
