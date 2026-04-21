import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentUsersTable({ users }: { users: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {["Name", "Role", "Joined"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-sm truncate max-w-[140px]">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">{u.email}</p>
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
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
