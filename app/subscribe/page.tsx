import { createClient } from "@/lib/supabase/server";
import { SubscribePage } from "@/components/subscribe/subscribe-page";
import { Navbar } from "@/components/shared/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Subscribe" };

export default async function SubscribeRoute() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, logo_url")
    .eq("is_active", true)
    .order("is_featured", { ascending: false });

  return (
    <div className="min-h-screen">
      <Navbar />
      <SubscribePage charities={charities ?? []} />
    </div>
  );
}
