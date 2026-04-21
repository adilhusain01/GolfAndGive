import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { CreditCard, Heart, Trophy, Calendar } from "lucide-react";
import { formatDate, getMonthLabel } from "@/lib/utils";

// ─── Subscription Status ──────────────────────────────────────
export function SubscriptionStatusCard({ subscription }: { subscription: any }) {
  const isActive = subscription?.status === "active";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CreditCard className="size-4" /> Subscription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={isActive ? "default" : "secondary"} className="mb-2">
          {isActive ? "Active" : subscription?.status ?? "None"}
        </Badge>
        {isActive ? (
          <>
            <p className="font-semibold capitalize">{subscription.plan} Plan</p>
            <p className="text-xs text-muted-foreground mt-1">
              Renews {formatDate(subscription.current_period_end)}
            </p>
          </>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">No active subscription</p>
            <Button size="sm" asChild>
              <Link href="/subscribe">Subscribe now</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Charity Card ─────────────────────────────────────────────
export function CharityCard({ subscription }: { subscription: any }) {
  const charity = subscription?.charities;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Heart className="size-4" /> Your Charity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {charity ? (
          <>
            <p className="font-semibold">{charity.name}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Contribution</span>
                <span className="font-medium text-primary">{subscription.charity_percentage}%</span>
              </div>
              <Progress value={subscription.charity_percentage} className="h-1.5" />
            </div>
            <Button variant="link" size="sm" asChild className="px-0 h-auto mt-1 text-xs">
              <Link href="/dashboard/charity">Change charity →</Link>
            </Button>
          </>
        ) : (
          <div className="mt-1">
            <p className="text-sm text-muted-foreground mb-2">No charity selected</p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/charity">Choose charity</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Draw Participation Card ──────────────────────────────────
export function DrawParticipationCard({
  draw, scores
}: { draw: any; scores: any[] }) {
  const eligible     = scores.length >= 1;
  const hasEnoughScores = scores.length === 5;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="size-4" /> Next Draw
        </CardTitle>
      </CardHeader>
      <CardContent>
        {draw ? (
          <>
            <p className="font-semibold">{getMonthLabel(draw.draw_month)}</p>
            <Badge
              variant={eligible ? "default" : "secondary"}
              className="mt-1.5 text-xs"
            >
              {eligible ? "Entered ✓" : "Not eligible"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {scores.length}/5 scores entered
            </p>
            <Progress value={(scores.length / 5) * 100} className="h-1.5 mt-1" />
            {!hasEnoughScores && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Add {5 - scores.length} more score{5 - scores.length !== 1 ? "s" : ""} to maximise your entry.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming draw configured.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Winnings Card ────────────────────────────────────────────
export function WinningsCard({ winners }: { winners: any[] }) {
  const totalWon  = winners
    .filter((w) => w.payment_status === "paid")
    .reduce((sum, w) => sum + Number(w.prize_amount), 0);
  const pending   = winners.filter((w) => w.payment_status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          My Winnings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {winners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No winnings yet. Keep playing!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <p className="text-xs text-muted-foreground">Total paid out</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{totalWon.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent/10">
                <p className="text-xs text-muted-foreground">Pending payments</p>
                <p className="text-2xl font-bold text-accent-foreground">{pending.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              {winners.slice(0, 5).map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                  <div>
                    <span className="font-medium capitalize">{w.prize_tier}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {w.draws?.draw_month && getMonthLabel(w.draws.draw_month)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">₹{Number(w.prize_amount).toLocaleString("en-IN")}</span>
                    <Badge
                      variant={w.payment_status === "paid" ? "default" : w.payment_status === "rejected" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {w.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {pending.length > 0 && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/dashboard/winners">View pending proofs</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
