import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CharityGrid } from "@/components/shared/charity-grid";
import { HowItWorks } from "@/components/shared/how-it-works";
import { PrizePoolPreview } from "@/components/shared/prize-pool-preview";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Heart, Trophy, Star, ArrowRight, TrendingUp } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredCharity } = await supabase
    .from("charities")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(1)
    .single();

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, slug, description, logo_url")
    .eq("is_active", true)
    .limit(6);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="gradient-hero relative flex-1 flex flex-col items-center justify-center px-4 py-32 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl" />
        </div>

        <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-sm font-medium">
          <Heart className="size-3.5 text-primary" />
          Play golf. Change lives.
        </Badge>

        <h1 className="max-w-4xl text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
          Your swing funds{" "}
          <span className="text-primary">someone's</span>{" "}
          future
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground mb-10">
          Enter your Stableford scores each month. Win prizes. A portion of every
          subscription goes directly to the charity you choose.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild className="gap-2 text-base px-8 h-12">
            <Link href="/signup">
              Start for ₹499/month
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base h-12">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="mt-16 flex flex-wrap gap-x-12 gap-y-4 justify-center text-sm text-muted-foreground">
          {[
            { icon: TrendingUp, value: "₹2.4L+", label: "Prize pool distributed" },
            { icon: Heart,      value: "₹68K+",  label: "Donated to charities"   },
            { icon: Star,       value: "1,200+", label: "Active members"         },
            { icon: Trophy,     value: "48",      label: "Monthly winners"        },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-primary" />
              <strong className="text-foreground">{value}</strong> {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <HowItWorks />

      {/* ── FEATURED CHARITY ─────────────────────────────── */}
      {featuredCharity && (
        <section className="py-24 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-4">Spotlight Charity</Badge>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">{featuredCharity.name}</h2>
                <p className="text-muted-foreground text-lg mb-6">{featuredCharity.description}</p>
                <Button asChild variant="outline">
                  <Link href={`/charities/${featuredCharity.slug}`}>Learn more</Link>
                </Button>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {featuredCharity.cover_url ? (
                    <img src={featuredCharity.cover_url} alt={featuredCharity.name}
                      className="w-full h-64 object-cover" />
                  ) : (
                    <div className="w-full h-64 bg-primary/10 flex items-center justify-center">
                      <Heart className="size-16 text-primary/40" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* ── PRIZE POOL ───────────────────────────────────── */}
      <PrizePoolPreview />

      {/* ── CHARITIES ────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Choose your cause</h2>
            <p className="text-muted-foreground">Every membership funds the charity that matters most to you.</p>
          </div>
          <CharityGrid charities={charities ?? []} />
          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link href="/charities">View all charities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="py-24 px-4 bg-primary text-primary-foreground text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to play and give?</h2>
        <p className="text-primary-foreground/80 text-lg mb-8 max-w-md mx-auto">
          Join 1,200+ golfers who compete monthly while making a real difference.
        </p>
        <Button size="lg" variant="secondary" asChild className="gap-2 text-base h-12 px-8">
          <Link href="/signup">
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      <Footer />
    </div>
  );
}
