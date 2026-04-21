"use client";

import { useMemo } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Heart, Trophy, Users } from "lucide-react";

const COLORS = ["hsl(152,55%,45%)", "hsl(43,90%,55%)", "hsl(210,80%,60%)", "hsl(330,70%,60%)"];

interface Props {
  contributions: any[];
  draws:         any[];
  subsGrowth:    any[];
}

export function ReportsClient({ contributions, draws, subsGrowth }: Props) {
  // Monthly charity contribution totals
  const charityByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of contributions) {
      const month = format(startOfMonth(parseISO(c.created_at)), "MMM yy");
      map[month] = (map[month] ?? 0) + Number(c.amount);
    }
    return Object.entries(map).map(([month, total]) => ({ month, total: +total.toFixed(0) }));
  }, [contributions]);

  // Draw prize pools
  const drawPools = useMemo(() => draws.map((d) => ({
    month:   format(parseISO(d.draw_month), "MMM yy"),
    jackpot: +Number(d.jackpot_amount).toFixed(0),
    match4:  +Number(d.pool_4match).toFixed(0),
    match3:  +Number(d.pool_3match).toFixed(0),
  })), [draws]);

  // Subscription growth (cumulative)
  const subGrowthData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of subsGrowth) {
      const month = format(startOfMonth(parseISO(s.created_at)), "MMM yy");
      map[month] = (map[month] ?? 0) + 1;
    }
    let cum = 0;
    return Object.entries(map).map(([month, count]) => {
      cum += count;
      return { month, count, cumulative: cum };
    });
  }, [subsGrowth]);

  // Charity breakdown pie
  const charityPie = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    for (const c of contributions) {
      const id = c.charity_id;
      if (!map[id]) map[id] = { name: c.charities?.name ?? id.slice(0, 6), value: 0 };
      map[id].value += Number(c.amount);
    }
    return Object.values(map).map((v) => ({ ...v, value: +v.value.toFixed(0) }));
  }, [contributions]);

  const totalCharity = contributions.reduce((s, c) => s + Number(c.amount), 0);
  const totalPrizes  = draws.reduce((s, d) => s + Number(d.jackpot_amount) + Number(d.pool_4match) + Number(d.pool_3match), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">Platform-wide trends and impact data.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Subscribers",    value: subsGrowth.length,                        icon: Users,    color: "text-blue-500" },
          { label: "Total to Charities",   value: `₹${totalCharity.toLocaleString("en-IN")}`, icon: Heart,  color: "text-rose-500" },
          { label: "Total Prize Pools",    value: `₹${totalPrizes.toLocaleString("en-IN")}`,  icon: Trophy, color: "text-amber-500" },
          { label: "Draws Published",      value: draws.length,                             icon: BarChart3, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <Icon className={`size-4 ${color} mb-1`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscriber growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={subGrowthData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152,55%,45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152,55%,45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="cumulative" stroke="hsl(152,55%,45%)" fill="url(#grad1)" name="Total subs" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charity contributions by month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Charity Contributions (₹)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charityByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="total" fill="hsl(330,70%,60%)" name="Donated (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Draw prize pools */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prize Pool Distribution by Draw</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={drawPools}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="jackpot" stackId="a" fill={COLORS[1]} name="Jackpot" radius={[0, 0, 0, 0]} />
                <Bar dataKey="match4"  stackId="a" fill={COLORS[0]} name="4-Match" />
                <Bar dataKey="match3"  stackId="a" fill={COLORS[2]} name="3-Match" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charity split pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contributions by Charity</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={charityPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {charityPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: any) => `₹${Number(v).toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
