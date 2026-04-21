"use client";

import { format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DrawStatsChart({ draws }: { draws: any[] }) {
  const data = draws.map((d) => ({
    month:   format(parseISO(d.draw_month), "MMM yy"),
    jackpot: +Number(d.jackpot_amount).toFixed(0),
    match4:  +Number(d.pool_4match).toFixed(0),
    match3:  +Number(d.pool_3match).toFixed(0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Prize Pools (Recent Draws)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No published draws yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => `₹${Number(v).toLocaleString("en-IN")}`}
              />
              <Bar dataKey="jackpot" fill="hsl(43,90%,55%)"  name="Jackpot"  radius={[3, 3, 0, 0]} />
              <Bar dataKey="match4"  fill="hsl(152,55%,45%)" name="4-Match"  radius={[3, 3, 0, 0]} />
              <Bar dataKey="match3"  fill="hsl(210,80%,60%)" name="3-Match"  radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
