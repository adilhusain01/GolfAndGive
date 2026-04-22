"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LayoutDashboard, Heart, Trophy, Settings,
  LogOut, ShieldCheck, ChevronRight, Menu, X, Loader2, ArrowUpRight, CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const NAV = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Overview"    },
  { href: "/dashboard/draws",    icon: Trophy,          label: "Draws"       },
  { href: "/dashboard/charity",  icon: Heart,           label: "My Charity"  },
  { href: "/dashboard/settings", icon: Settings,        label: "Settings"    },
];

const ADMIN_NAV = [
  { href: "/admin",                icon: ShieldCheck, label: "Admin Panel"  },
];

interface Props {
  profile:      any;
  subscription: any;
}

export function DashboardSidebar({ profile, subscription }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const [open, setOpen]       = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5">
        <div className="paper-panel overflow-hidden border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)/0.92))] p-4 shadow-[0_18px_50px_hsl(var(--foreground)/0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-primary text-primary-foreground shadow-[0_14px_28px_hsl(var(--primary)/0.28)]">
              <Heart className="size-5" />
            </div>
            <div>
              <p className="font-display text-xl leading-none">Golf & Give</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Member Ledger
              </p>
            </div>
          </div>

          <div className="soft-rule my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>Plan status</span>
              <CircleDot className={cn("size-3.5", subscription?.status === "active" ? "text-primary" : "text-muted-foreground")} />
            </div>
            <Badge
              variant={subscription?.status === "active" ? "default" : "secondary"}
              className="w-full justify-center rounded-full py-1.5"
            >
              {subscription?.status === "active"
                ? `${subscription.plan === "yearly" ? "Yearly" : "Monthly"} plan active`
                : "No active plan"}
            </Badge>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-background/70 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Charity
                </p>
                <p className="mt-2 font-medium">
                  {subscription?.charities?.name ?? "Select one"}
                </p>
              </div>
              <div className="rounded-2xl bg-background/70 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Renewal
                </p>
                <p className="mt-2 font-medium">
                  {subscription?.current_period_end
                    ? formatDate(subscription.current_period_end, {
                        day: "numeric",
                        month: "short",
                      })
                    : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="section-label">Navigate</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
              pathname === href
                ? "border-primary/20 bg-primary text-primary-foreground shadow-[0_16px_36px_hsl(var(--primary)/0.26)]"
                : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
            <ChevronRight
              className={cn(
                "ml-auto size-3 transition-transform",
                pathname === href ? "opacity-100" : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100",
              )}
            />
          </Link>
        ))}

        {profile?.role === "admin" && (
          <>
            <div className="px-1 pt-4">
              <p className="section-label">Operations</p>
            </div>
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
                  pathname.startsWith(href)
                    ? "border-primary/20 bg-primary text-primary-foreground shadow-[0_16px_36px_hsl(var(--primary)/0.26)]"
                    : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
                <ArrowUpRight className="ml-auto size-3 opacity-60" />
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4">
        <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-4 shadow-[0_12px_30px_hsl(var(--foreground)/0.06)]">
          <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={profile?.avatar_url ?? ""} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <Button
              variant="ghost" size="icon" className="size-8 shrink-0 rounded-full"
              onClick={handleLogout} disabled={loggingOut}
            >
              {loggingOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[312px] shrink-0 border-r border-border/70 bg-background/60 backdrop-blur-xl lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-5 z-50 flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/90 shadow-sm lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="h-full w-[312px] border-r border-border/70 bg-background/95 shadow-xl backdrop-blur-xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
