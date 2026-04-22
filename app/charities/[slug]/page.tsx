import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { DonationCard } from "@/components/shared/donation-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ExternalLink, Heart, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("charities")
    .select("name")
    .eq("slug", params.slug)
    .single();
  return { title: data?.name ?? "Charity" };
}

export default async function CharityPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  const { data: charity } = await supabase
    .from("charities")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!charity) notFound();

  const events: any[] = charity.events ?? [];

  return (
    <div className="editorial-shell min-h-screen">
      <Navbar />

      <main className="px-4 pb-8 pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="paper-panel relative overflow-hidden rounded-[2.7rem] border border-border/70">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[340px] overflow-hidden border-b border-border/60 lg:min-h-[520px] lg:border-b-0 lg:border-r">
                {charity.cover_url ? (
                  <Image
                    src={charity.cover_url}
                    alt={charity.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary/8">
                    <Heart className="size-20 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/15 to-transparent" />
                {charity.is_featured && (
                  <Badge className="absolute left-6 top-6">Featured charity</Badge>
                )}
              </div>

              <div className="px-6 py-8 md:px-8 md:py-10">
                <div className="flex items-start gap-4">
                  <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-border/70 bg-background shadow-sm">
                    {charity.logo_url ? (
                      <Image
                        src={charity.logo_url}
                        alt={charity.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Heart className="size-6 text-primary" />
                    )}
                  </div>

                  <div>
                    <span className="section-label mb-4">Partner profile</span>
                    <h1 className="font-display text-5xl leading-none">
                      {charity.name}
                    </h1>
                    {charity.website_url && (
                      <a
                        href={charity.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        Visit organisation website
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {charity.description && (
                  <p className="mt-8 text-base leading-8 text-muted-foreground">
                    {charity.description}
                  </p>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/70 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Membership route
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Subscribers can direct a chosen share of each billing cycle to this charity.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/70 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Direct route
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Visitors can also send a one-time donation without joining the membership.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="pl-6">
                    <Link href={`/subscribe?charity=${charity.id}`}>
                      Subscribe & support
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  {charity.website_url && (
                    <Button variant="outline" asChild>
                      <a href={charity.website_url} target="_blank" rel="noopener noreferrer">
                        Visit official website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="paper-panel rounded-[2rem] border border-border/70 px-6 py-6">
                <span className="section-label mb-5">Overview</span>
                <h2 className="font-display text-4xl">Why members choose this partner</h2>
                <p className="mt-4 text-sm leading-8 text-muted-foreground">
                  Golf & Give is designed so that charitable destination is never hidden inside the payment flow. This profile exists to make the support path explicit before a visitor commits.
                </p>
              </div>

              {events.length > 0 && (
                <div className="paper-panel rounded-[2rem] border border-border/70 px-6 py-6">
                  <span className="section-label mb-5">Events</span>
                  <h2 className="font-display text-4xl">Upcoming activity</h2>
                  <div className="mt-6 space-y-3">
                    {events.map((event: any, index: number) => (
                      <Card key={index} className="border-border/60 bg-background/70">
                        <CardContent className="flex items-start gap-3 py-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Calendar className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            {event.date && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatDate(event.date)}
                              </p>
                            )}
                            {event.description && (
                              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Card className="paper-panel border-border/70">
                <CardContent className="space-y-3 p-6">
                  <span className="section-label">Support route</span>
                  <h2 className="font-display text-4xl">Attach your membership here</h2>
                  <p className="text-sm leading-8 text-muted-foreground">
                    Subscribe to Golf & Give and direct a selected percentage of every recurring payment to {charity.name}.
                  </p>
                  <Button className="w-full pl-6" asChild>
                    <Link href={`/subscribe?charity=${charity.id}`}>
                      Review membership
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <DonationCard charityId={charity.id} charityName={charity.name} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
