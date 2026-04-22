import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Heart, ExternalLink, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase.from("charities").select("name").eq("slug", params.slug).single();
  return { title: data?.name ?? "Charity" };
}

export default async function CharityPage({ params }: { params: { slug: string } }) {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero / cover */}
      <div className="w-full h-64 bg-primary/10 relative overflow-hidden">
        {charity.cover_url && (
          <Image
            src={charity.cover_url}
            alt={charity.name}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        {charity.is_featured && (
          <Badge className="absolute top-4 left-4">Featured Charity</Badge>
        )}
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 pb-16 w-full -mt-10 relative z-10">
        <div className="flex items-start gap-4 mb-8">
          <div className="relative size-16 rounded-2xl bg-background border-2 border-border flex items-center justify-center shadow-lg overflow-hidden">
            {charity.logo_url
              ? <Image src={charity.logo_url} alt={charity.name} fill sizes="64px" className="object-cover" unoptimized />
              : <Heart className="size-7 text-primary" />}
          </div>
          <div className="flex-1 pt-4">
            <h1 className="text-3xl font-bold">{charity.name}</h1>
            {charity.website_url && (
              <a href={charity.website_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline">
                {charity.website_url} <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {charity.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">About</h2>
                <p className="text-muted-foreground leading-relaxed">{charity.description}</p>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="size-5" /> Upcoming Events
                </h2>
                <div className="space-y-3">
                  {events.map((ev: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="py-3 flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{ev.title}</p>
                          {ev.date && <p className="text-xs text-muted-foreground">{formatDate(ev.date)}</p>}
                          {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Support this charity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Subscribe to Golf & Give and choose {charity.name} as your charity. A portion of every payment goes directly to them.
                </p>
                <Button className="w-full" asChild>
                  <Link href={`/subscribe?charity=${charity.id}`}>Subscribe & Give</Link>
                </Button>
                {charity.website_url && (
                  <Button variant="outline" className="w-full gap-1.5" asChild>
                    <a href={charity.website_url} target="_blank" rel="noopener noreferrer">
                      Visit website <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
