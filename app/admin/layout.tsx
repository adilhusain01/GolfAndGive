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
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
