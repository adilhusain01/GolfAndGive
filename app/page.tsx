import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CharityGrid } from "@/components/shared/charity-grid";
import { HowItWorks } from "@/components/shared/how-it-works";
import { PrizePoolPreview } from "@/components/shared/prize-pool-preview";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Trophy,
  WalletCards,
} from "lucide-react";

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
    <div className="editorial-shell min-h-screen">
      <Navbar />

      <main>
        <section className="px-4 pb-12 pt-10 md:pb-20 md:pt-14">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="paper-panel rounded-[2.7rem] border border-border/70 px-6 py-8 md:px-10 md:py-12">
              <span className="section-label mb-6">
                <Sparkles className="size-3.5" />
                A membership model for generosity
              </span>

              <h1 className="editorial-kicker max-w-3xl">
                A better reason to keep score.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Golf & Give turns a monthly score-entry ritual into something larger:
                a recurring charity contribution, a live prize pool, and a member
                experience that rewards consistency rather than noise.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="pl-7 text-base">
                  <Link href="/signup">
                    Become a member
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link href="/charities">Explore charities</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: Trophy,
                    title: "Monthly draw cadence",
                    copy: "Retained scores form a fresh five-number entry every cycle.",
                  },
                  {
                    icon: Heart,
                    title: "Charity attached",
                    copy: "Each active subscription carries a member-selected percentage.",
                  },
                  {
                    icon: WalletCards,
                    title: "Direct support too",
                    copy: "Visitors can donate one-time without joining the membership.",
                  },
                ].map(({ icon: Icon, title, copy }) => (
                  <div
                    key={title}
                    className="rounded-[1.6rem] border border-border/60 bg-background/70 px-4 py-4"
                  >
                    <Icon className="size-4 text-primary" />
                    <p className="mt-3 font-medium">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="paper-panel overflow-hidden border-border/70">
                <CardContent className="relative min-h-[340px] p-0">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent)/0.28),transparent_24%),radial-gradient(circle_at_80%_18%,hsl(var(--primary)/0.24),transparent_28%),linear-gradient(180deg,hsl(var(--card)),hsl(35_44%_94%))]" />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div>
                      <Badge variant="outline" className="bg-background/70">
                        Current model
                      </Badge>
                      <h2 className="mt-5 font-display text-4xl leading-none">
                        Competition with visible consequence.
                      </h2>
                    </div>

                    <div className="grid gap-3">
                      {[
                        "Enter your latest Stableford rounds",
                        "Trigger monthly draw eligibility with retained scores",
                        "Send a defined slice of every payment to a chosen cause",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground/90"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="paper-panel border-border/70">
                  <CardContent className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Monthly entry rule
                    </p>
                    <p className="mt-3 font-display text-4xl">5 retained scores</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      New rounds push out the oldest entry automatically so draw participation stays current.
                    </p>
                  </CardContent>
                </Card>
                <Card className="paper-panel border-border/70">
                  <CardContent className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Charity baseline
                    </p>
                    <p className="mt-3 font-display text-4xl">10% minimum</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      Members can increase the charity share well beyond the default split whenever they want.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />

        {featuredCharity && (
          <section className="px-4 py-6 md:py-12">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <Card className="paper-panel overflow-hidden border-border/70">
                <CardContent className="p-0">
                  {featuredCharity.cover_url ? (
                    <div className="relative h-full min-h-[360px] w-full">
                      <Image
                        src={featuredCharity.cover_url}
                        alt={featuredCharity.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[360px] items-center justify-center bg-primary/8">
                      <Heart className="size-16 text-primary/35" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="paper-panel rounded-[2.4rem] border border-border/70 px-6 py-8 md:px-8 md:py-10">
                <span className="section-label mb-5">Spotlight charity</span>
                <h2 className="font-display text-5xl leading-none">
                  {featuredCharity.name}
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  {featuredCharity.description}
                </p>

                <div className="soft-rule my-8" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-border/60 bg-background/70 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Member path
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Select this organisation during membership checkout and keep funding it on every billing cycle.
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-border/60 bg-background/70 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Direct support
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Visitors can also make a one-time donation from the charity profile page without subscribing.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="pl-6">
                    <Link href={`/charities/${featuredCharity.slug}`}>
                      View charity profile
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/charities">See all charities</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <PrizePoolPreview />

        <section className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="section-label mb-5">Directory</span>
                <h2 className="editorial-kicker max-w-2xl">
                  Choose a cause before you ever choose a plan.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-muted-foreground">
                The brand is built around charitable destination first. The membership only matters because the impact path is clear.
              </p>
            </div>

            <CharityGrid charities={charities ?? []} />
          </div>
        </section>

        <section className="px-4 pb-10 pt-4">
          <div className="mx-auto max-w-6xl rounded-[2.6rem] bg-primary px-6 py-10 text-primary-foreground shadow-[0_30px_60px_hsl(var(--primary)/0.2)] md:px-10 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <span className="section-label border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/80">
                  Membership invitation
                </span>
                <h2 className="mt-5 font-display text-5xl leading-none md:text-6xl">
                  Less golf branding.
                  <br />
                  More real consequence.
                </h2>
              </div>
              <div>
                <p className="text-base leading-8 text-primary-foreground/80">
                  Join to log retained scores, participate in the monthly draw, and keep a chosen organisation attached to every billing cycle.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" asChild className="pl-6">
                    <Link href="/signup">
                      Start membership
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link href="/subscribe">Review plans</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
