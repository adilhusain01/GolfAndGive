import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Trophy, Heart } from "lucide-react";
import { RecentUsersTable } from "@/components/admin/recent-users-table";
import { DrawStatsChart } from "@/components/admin/draw-stats-chart";
import { splitSubscription } from "@/lib/dodo/client";
import type { Metadata } from "next";

type SubscriptionPool = {
  amount_pence?: number | null;
  charity_percentage?: number | null;
};

type CharityTotal = {
  amount?: string | null;
};

export const metadata: Metadata = { title: "Admin — Overview" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: activeSubs },
    { data: pool },
    { data: charityTotal },
    { data: recentUsers },
    { data: draws },
  ] = (await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("subscriptions")
      .select("amount_pence, charity_percentage")
      .eq("status", "active"),
    supabase.from("charity_contributions").select("amount"),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at, role")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("draws")
      .select("draw_month, status, jackpot_amount, pool_4match, pool_3match")
      .order("draw_month", { ascending: false })
      .limit(6),
  ])) as [
    { count: number | null },
    { count: number | null },
    { data: SubscriptionPool[] | null },
    { data: CharityTotal[] | null },
    { data: any[] | null },
    { data: any[] | null },
  ];

  const totalPool =
    pool?.reduce(
      (sum, sub) =>
        sum +
        splitSubscription(
          sub.amount_pence ?? 0,
          sub.charity_percentage ?? 10,
        ).pool,
      0,
    ) ?? 0;
  const totalCharity =
    charityTotal?.reduce((s, c) => s + Number(c.amount), 0) ?? 0;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Active Subscribers",
      value: activeSubs ?? 0,
      icon: CreditCard,
      color: "text-primary",
    },
    {
      label: "Cumulative Prize Pool",
      value: `₹${totalPool.toLocaleString("en-IN")}`,
      icon: Trophy,
      color: "text-amber-500",
    },
    {
      label: "Total to Charities",
      value: `₹${totalCharity.toLocaleString("en-IN")}`,
      icon: Heart,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="paper-panel overflow-hidden border-border/70 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--accent)/0.18))] p-6 shadow-[0_24px_60px_hsl(var(--foreground)/0.08)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="section-label">Operations Overview</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
              Monitor growth, payouts, and charitable flow from a single console.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              This view tracks the health of the membership base, the size of upcoming prize pools,
              and the money already routed to charities. Use it to spot drift before it becomes an operational issue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: "Latest cohort",
                value: recentUsers?.length ? `${recentUsers.length} recent signups` : "No signups",
                note: "Newest profiles loaded from the live project",
              },
              {
                label: "Recent draws",
                value: `${draws?.length ?? 0} tracked`,
                note: "Latest six draw records in this report",
              },
              {
                label: "Charity ledger",
                value: `₹${totalCharity.toLocaleString("en-IN")}`,
                note: "Historical contributions booked",
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
        <p className="section-label">Live Metrics</p>
        <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Admin Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Platform-wide stats at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Icon className={`size-3.5 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl leading-none">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DrawStatsChart draws={draws ?? []} />
        <RecentUsersTable users={recentUsers ?? []} />
      </div>
    </div>
  );
}
