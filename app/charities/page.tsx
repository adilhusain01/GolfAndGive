import { createClient } from "@/lib/supabase/server";
import { CharityGrid } from "@/components/shared/charity-grid";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Charities" };

export default async function CharitiesPage() {
  const supabase = await createClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, slug, description, logo_url")
    .eq("is_active", true)
    .order("is_featured", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <Heart className="size-6 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Our Partner Charities</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Every Golf & Give membership supports one of these organisations. You choose which one.
          </p>
        </div>
        <CharityGrid charities={charities ?? []} />
      </main>
      <Footer />
    </div>
  );
}
