import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";

type Profile = {
  role?: string | null;
  full_name?: string | null;
  email?: string | null;
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single()) as { data: Profile | null };

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_26%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.14),transparent_22%),hsl(var(--background))]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,hsl(var(--foreground)/0.03)_50%,transparent_100%)]" />
      <AdminSidebar profile={profile} />
      <main className="relative flex-1 overflow-y-auto px-4 pb-28 pt-24 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
