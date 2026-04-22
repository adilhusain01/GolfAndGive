import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

type AdminUser = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  subscriptions?:
    | {
        plan?: string | null;
        status?: string | null;
        current_period_end?: string | null;
      }[]
    | null;
};

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = (await supabase
    .from("profiles")
    .select(
      `
      id, full_name, email, role, created_at,
      subscriptions (
        plan, status, current_period_end
      )
    `,
    )
    .order("created_at", { ascending: false })) as { data: AdminUser[] | null };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm">
          {users?.length ?? 0} total users
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {["Name", "Email", "Role", "Plan", "Sub Status", "Joined"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-muted-foreground px-4 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {(users ?? []).map((user) => {
                const sub = user.subscriptions?.[0];
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 capitalize">{sub?.plan ?? "—"}</td>
                    <td className="px-4 py-3">
                      {sub ? (
                        <Badge
                          variant={
                            sub.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {sub.status}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.created_at ? formatDate(user.created_at) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
