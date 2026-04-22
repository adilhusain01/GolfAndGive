import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentUsersTable({ users }: { users: any[] }) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/35">
            <tr className="border-b border-border/70">
              {["Name", "Role", "Joined"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm truncate max-w-[140px]">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className="rounded-full text-xs">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(u.created_at)}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground text-xs">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
