import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap, Star } from "lucide-react";

const TIERS = [
  {
    icon:     Trophy,
    match:    "5 Numbers",
    share:    "40%",
    label:    "Jackpot",
    rollover: true,
    color:    "text-amber-500",
    bg:       "bg-amber-500/10",
    border:   "border-amber-500/30",
  },
  {
    icon:     Zap,
    match:    "4 Numbers",
    share:    "35%",
    label:    "Second Prize",
    rollover: false,
    color:    "text-primary",
    bg:       "bg-primary/10",
    border:   "border-primary/30",
  },
  {
    icon:     Star,
    match:    "3 Numbers",
    share:    "25%",
    label:    "Third Prize",
    rollover: false,
    color:    "text-blue-400",
    bg:       "bg-blue-400/10",
    border:   "border-blue-400/30",
  },
];

export function PrizePoolPreview() {
  return (
    <section id="prizes" className="px-4 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <span className="section-label mb-5">Prize architecture</span>
          <h2 className="editorial-kicker mx-auto max-w-3xl">
            A fixed split, published monthly, with the jackpot allowed to gather pressure.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            The prize pool is derived from active subscriptions after the platform fee and member-selected charity allocation are removed.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map(({ icon: Icon, match, share, label, rollover, color, bg, border }) => (
            <Card key={match} className={`paper-panel border ${border}`}>
              <CardContent className="pt-6 text-center">
                <div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl ${bg}`}>
                  <Icon className={`size-6 ${color}`} />
                </div>
                <p className={`mb-1 text-4xl font-black ${color}`}>{share}</p>
                <p className="font-display text-2xl">{label}</p>
                <p className="mb-3 text-sm text-muted-foreground">Match {match}</p>
                {rollover && (
                  <Badge variant="outline" className="text-xs">
                    Jackpot rolls over if unclaimed
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prize split equally between multiple winners in the same tier. 10% platform fee + your charity contribution deducted first.
        </p>
      </div>
    </section>
  );
}
