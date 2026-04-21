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
    <section id="prizes" className="py-24 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Monthly prize pool</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Prizes are auto-calculated from active subscriber count. Match your scores to the winning numbers to win.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map(({ icon: Icon, match, share, label, rollover, color, bg, border }) => (
            <Card key={match} className={`border-2 ${border}`}>
              <CardContent className="pt-6 text-center">
                <div className={`mx-auto size-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`size-6 ${color}`} />
                </div>
                <p className={`text-4xl font-black ${color} mb-1`}>{share}</p>
                <p className="font-semibold mb-1">{label}</p>
                <p className="text-sm text-muted-foreground mb-3">Match {match}</p>
                {rollover && (
                  <Badge variant="outline" className="text-xs">
                    Jackpot rolls over if unclaimed
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Prize split equally between multiple winners in the same tier. 10% platform fee + your charity contribution deducted first.
        </p>
      </div>
    </section>
  );
}
