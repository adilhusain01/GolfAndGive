import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Trophy, Heart, TrendingUp } from "lucide-react";
import { RecentUsersTable } from "@/components/admin/recent-users-table";
import { DrawStatsChart } from "@/components/admin/draw-stats-chart";
import type { Metadata } from "next";

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
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subscriptions").select("amount_pence").eq("status", "active"),
    supabase.from("charity_contributions").select("amount"),
    supabase.from("profiles").select("id, full_name, email, created_at, role")
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("draws").select("draw_month, status, jackpot_amount, pool_4match, pool_3match")
      .order("draw_month", { ascending: false }).limit(6),
  ]);

  const totalPool = pool?.reduce((s, sub) => s + sub.amount_pence / 100 * 0.5, 0) ?? 0;
  const totalCharity = charityTotal?.reduce((s, c) => s + Number(c.amount), 0) ?? 0;

  const stats = [
    { label: "Total Users",         value: totalUsers ?? 0,                       icon: Users,       color: "text-blue-500"  },
    { label: "Active Subscribers",  value: activeSubs ?? 0,                       icon: CreditCard,  color: "text-primary"   },
    { label: "Cumulative Prize Pool", value: `₹${totalPool.toLocaleString("en-IN")}`, icon: Trophy,  color: "text-amber-500" },
    { label: "Total to Charities",  value: `₹${totalCharity.toLocaleString("en-IN")}`, icon: Heart,  color: "text-rose-500"  },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide stats at a glance.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Icon className={`size-3.5 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
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
