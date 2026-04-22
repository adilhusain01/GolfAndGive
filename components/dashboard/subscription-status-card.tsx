import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowUpRight, Calendar, CreditCard, Heart, Sparkles, Trophy } from "lucide-react";
import { formatCurrency, formatDate, getMonthLabel } from "@/lib/utils";

// ─── Subscription Status ──────────────────────────────────────
export function SubscriptionStatusCard({ subscription }: { subscription: any }) {
  const isActive = subscription?.status === "active";
  const amount = subscription?.amount_pence ? formatCurrency(subscription.amount_pence) : null;

  return (
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CreditCard className="size-4" /> Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge variant={isActive ? "default" : "secondary"} className="rounded-full">
          {isActive ? "Active" : subscription?.status ?? "None"}
        </Badge>
        {isActive ? (
          <>
            <div className="rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--accent)/0.12))] p-4">
              <p className="font-display text-2xl capitalize">{subscription.plan} plan</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Renews {formatDate(subscription.current_period_end)}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-semibold">{amount ?? "Pending"}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-border/80 bg-background/60 p-4">
            <p className="text-sm text-muted-foreground mb-3">No active subscription</p>
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
  const charityContribution = subscription?.amount_pence
    ? Math.round((subscription.amount_pence * (subscription.charity_percentage ?? 10)) / 100)
    : null;

  return (
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Heart className="size-4" /> Your Charity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {charity ? (
          <>
            <div className="rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--accent)/0.12))] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl leading-none">{charity.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your contribution preference is active for this charity.
                  </p>
                </div>
                <Sparkles className="size-4 text-primary" />
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Contribution</span>
                <span className="font-medium text-primary">{subscription.charity_percentage}%</span>
              </div>
              <Progress value={subscription.charity_percentage} className="h-1.5" />
            </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Approx. donation share</span>
                <span className="font-semibold">
                  {charityContribution ? formatCurrency(charityContribution) : "Pending"}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-auto justify-start gap-2 px-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Link href="/dashboard/charity">
                Manage charity
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-border/80 bg-background/60 p-4">
            <p className="mb-3 text-sm text-muted-foreground">No charity selected</p>
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
  const eligible = scores.length === 5;
  const hasEnoughScores = scores.length === 5;

  return (
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar className="size-4" /> Next Draw
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {draw ? (
          <>
            <div className="rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--accent)/0.12))] p-4">
              <p className="font-display text-2xl">{getMonthLabel(draw.draw_month)}</p>
            <Badge
              variant={eligible ? "default" : "secondary"}
                className="mt-3 rounded-full text-xs"
            >
              {eligible ? "Entered ✓" : "Not eligible"}
            </Badge>
              <p className="mt-4 text-xs text-muted-foreground">
                {scores.length}/5 scores retained
              </p>
              <Progress value={(scores.length / 5) * 100} className="mt-2 h-1.5" />
            {!hasEnoughScores && (
                <p className="mt-2 text-xs text-muted-foreground">
                Add {5 - scores.length} more score{5 - scores.length !== 1 ? "s" : ""} to maximise your entry.
              </p>
            )}
            </div>
          </>
        ) : (
          <p className="rounded-[1.6rem] border border-dashed border-border/80 bg-background/60 p-4 text-sm text-muted-foreground">
            No upcoming draw configured.
          </p>
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
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
      <CardHeader className="border-b border-border/60 bg-[linear-gradient(180deg,hsl(var(--card)),transparent)]">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          My Winnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {winners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No winnings yet. Keep playing!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.6rem] border border-border/70 bg-primary/8 p-4">
                <p className="text-xs text-muted-foreground">Total paid out</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{totalWon.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-border/70 bg-accent/10 p-4">
                <p className="text-xs text-muted-foreground">Pending payments</p>
                <p className="text-2xl font-bold text-accent-foreground">{pending.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              {winners.slice(0, 5).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-3 text-sm">
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
