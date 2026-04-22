import { createAdminClient, createClient } from "@/lib/supabase/server";
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
  const adminSupabase = createAdminClient();
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

    adminSupabase
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
    <div className="space-y-8 animate-fade-in">
      <section className="paper-panel overflow-hidden border-border/70 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--accent)/0.16))] p-6 shadow-[0_24px_60px_hsl(var(--foreground)/0.08)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="section-label">Member Overview</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
              Keep your scores, entry status, and giving aligned in one place.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              This is your operating view for the monthly draw. Track subscription health,
              confirm draw readiness, and see whether your contributions are pointed where you want them.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: "Subscription",
                value: hasActiveSubscription ? "Active" : (subscription?.status ?? "Pending"),
                note: subscription?.plan ? `${subscription.plan} plan` : "No plan",
              },
              {
                label: "Scores retained",
                value: `${scores?.length ?? 0}/5`,
                note: (scores?.length ?? 0) === 5 ? "Eligible for draw logic" : "Complete all five entries",
              },
              {
                label: "Latest draw",
                value: upcomingDraw ? "Configured" : "Not set",
                note: upcomingDraw?.draw_month ? new Date(upcomingDraw.draw_month).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Waiting for admin publish cycle",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] border border-border/70 bg-background/75 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div>
        <p className="section-label">Live Status</p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Your dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track your scores, draw readiness, and charitable impact without leaving the member console.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SubscriptionStatusCard subscription={subscription} />
        <CharityCard subscription={subscription} />
        <DrawParticipationCard draw={upcomingDraw} scores={scores ?? []} />
      </div>

      <ScoreWidget scores={scores ?? []} userId={user.id} />
      <WinningsCard winners={winners ?? []} />
    </div>
  );
}
