import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  SubscriptionStatusCard,
  CharityCard,
  DrawParticipationCard,
  WinningsCard,
} from "@/components/dashboard/subscription-status-card";
import { ScoreWidget } from "@/components/dashboard/score-widget";
import type { Metadata } from "next";

type DashboardSubscription = {
  status?: string | null;
  plan?: string | null;
  charity_percentage?: number | null;
  charities?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
};

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Parallel data fetching
  const [
    { data: subscription },
    { data: scores },
    { data: winners },
    { data: upcomingDraw },
  ] = (await Promise.all([
    supabase
      .from("subscriptions")
      .select("*, charities(id, name, slug, logo_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),

    supabase
      .from("golf_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .limit(5),

    supabase
      .from("winners")
      .select("*, draws(draw_month)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("draws")
      .select("*")
      .in("status", ["pending", "simulation"])
      .order("draw_month", { ascending: true })
      .limit(1)
      .single(),
  ])) as [
    { data: DashboardSubscription | null },
    { data: any[] | null },
    { data: any[] | null },
    { data: any | null },
  ];

  const hasActiveSubscription = subscription?.status === "active";

  if (!hasActiveSubscription && !subscription) {
    redirect("/subscribe");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your scores, draws, and charitable impact.
        </p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SubscriptionStatusCard subscription={subscription} />
        <CharityCard subscription={subscription} />
        <DrawParticipationCard draw={upcomingDraw} scores={scores ?? []} />
      </div>

      {/* Score entry */}
      <ScoreWidget scores={scores ?? []} userId={user.id} />

      {/* Winnings */}
      <WinningsCard winners={winners ?? []} />
    </div>
  );
}
