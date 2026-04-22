import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowUpRight } from "lucide-react";

interface Charity {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  logo_url:    string | null;
}

export function CharityGrid({ charities }: { charities: Charity[] }) {
  if (charities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Heart className="size-10 mx-auto mb-3 opacity-30" />
        <p>No charities listed yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {charities.map((c) => (
        <Link key={c.id} href={`/charities/${c.slug}`}>
          <Card className="paper-panel group h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
            <CardContent className="p-0">
              <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-5 py-6">
                <div className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-accent/15 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                <div className="relative flex items-start gap-3">
                  <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background shadow-sm">
                  {c.logo_url
                    ? <Image src={c.logo_url} alt={c.name} fill sizes="48px" className="object-cover" unoptimized />
                    : <Heart className="size-4 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl leading-none transition-colors group-hover:text-primary">
                      {c.name}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Partner profile
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-5">
                {c.description && (
                  <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{c.description}</p>
                )}
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                  Explore charity
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
