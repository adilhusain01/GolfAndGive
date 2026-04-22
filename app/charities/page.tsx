import { createClient } from "@/lib/supabase/server";
import { CharityGrid } from "@/components/shared/charity-grid";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Heart, Search, Sparkles } from "lucide-react";
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
    <div className="editorial-shell min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-16">
        <div className="paper-panel relative overflow-hidden rounded-[2.4rem] border border-border/70 px-6 py-10 md:px-10 md:py-14">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative text-center">
            <span className="section-label mb-5">Charity directory</span>
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Heart className="size-5" />
            </div>
            <h1 className="editorial-kicker mx-auto max-w-3xl">
              Organisations members can back through subscription and direct giving.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
              Browse the current charity roster, review the mission behind each partner, and decide where recurring or one-time support should land.
            </p>
          </div>

          <div className="mt-10 grid gap-4 border-t border-border/70 pt-6 md:grid-cols-3">
            {[
              { icon: Search, label: "Browse active partners", copy: "Every listed organisation is active in the current public directory." },
              { icon: Sparkles, label: "Inspect featured initiatives", copy: "Highlighted charities are surfaced on the homepage and subscription journey." },
              { icon: Heart, label: "Choose how to support", copy: "Members can subscribe with a charity allocation or donate directly from the profile page." },
            ].map(({ icon: Icon, label, copy }) => (
              <div key={label} className="rounded-[1.5rem] border border-border/60 bg-background/70 px-4 py-4 text-left">
                <Icon className="size-4 text-primary" />
                <p className="mt-3 font-medium">{label}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12">
          <CharityGrid charities={charities ?? []} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
