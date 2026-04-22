import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMonthLabel } from "@/lib/utils";
import { Trophy, Target } from "lucide-react";
import type { Metadata } from "next";

type DrawEntry = {
  id: string;
  numbers?: number[] | null;
  prize_tier?: string | null;
  match_count?: number | null;
  draws?: {
    draw_month?: string | null;
    winning_numbers?: number[] | null;
    status?: string | null;
  } | null;
};

export const metadata: Metadata = { title: "My Draws" };

export default async function DashboardDrawsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entries } = (await supabase
    .from("draw_entries")
    .select("*, draws(draw_month, winning_numbers, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as { data: DrawEntry[] | null };

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in">
      <div>
        <p className="section-label">Archive</p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">My Draw History</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          All monthly draws you've participated in.
        </p>
      </div>

      {!entries || entries.length === 0 ? (
        <Card className="border-border/70 bg-card/80">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="size-10 mx-auto mb-3 opacity-30" />
            <p>
              No draw entries yet. Add scores to participate in the next draw.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden border-border/70 bg-card/85 shadow-[0_12px_30px_hsl(var(--foreground)/0.05)]">
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">
                      {entry.draws?.draw_month &&
                        getMonthLabel(entry.draws.draw_month)}
                    </p>
                    <Badge
                      variant={
                        entry.draws?.status === "published"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs mt-1"
                    >
                      {entry.draws?.status}
                    </Badge>
                  </div>
                  {entry.prize_tier && (
                    <Badge className="gap-1.5 bg-amber-500 hover:bg-amber-500">
                      <Trophy className="size-3" /> {entry.prize_tier} winner!
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Target className="size-3" /> Your numbers
                    </p>
                    <div className="flex gap-1">
                      {(entry.numbers ?? []).map((n: number, i: number) => {
                        const winning = entry.draws?.winning_numbers ?? [];
                        const isMatch = winning.includes(n);
                        return (
                          <span
                            key={i}
                            className={`size-8 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-colors ${
                              isMatch
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted text-muted-foreground"
                            }`}
                          >
                            {n}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
                    const winningNumbers = entry.draws?.winning_numbers ?? [];
                    return winningNumbers.length > 0 ? (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Trophy className="size-3" /> Winning numbers
                        </p>
                        <div className="flex gap-1">
                          {winningNumbers.map((n: number, i: number) => (
                            <span
                              key={i}
                              className="size-8 rounded-full bg-amber-500/10 border-2 border-amber-500/40 text-amber-500 text-xs font-bold flex items-center justify-center"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {entry.match_count != null &&
                  entry.draws?.status === "published" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Matched <strong>{entry.match_count}</strong> number
                      {entry.match_count !== 1 ? "s" : ""}
                    </p>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
