import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink } from "lucide-react";

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
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {charities.map((c) => (
        <Link key={c.id} href={`/charities/${c.slug}`}>
          <Card className="h-full hover:border-primary/40 transition-colors group">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {c.logo_url
                    ? <img src={c.logo_url} alt={c.name} className="size-9 rounded-full object-cover" />
                    : <Heart className="size-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold group-hover:text-primary transition-colors flex items-center gap-1">
                    {c.name}
                    <ExternalLink className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </p>
                </div>
              </div>
              {c.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
