"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LayoutDashboard, Heart, Trophy, Settings,
  LogOut, ShieldCheck, ChevronRight, Menu, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
      {/* Logo */}
      <div className="p-5 flex items-center gap-2.5">
        <div className="size-8 rounded-xl bg-primary flex items-center justify-center">
          <Heart className="size-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">Golf & Give</span>
      </div>

      <Separator />

      {/* Sub status badge */}
      <div className="px-4 py-3">
        <Badge
          variant={subscription?.status === "active" ? "default" : "secondary"}
          className="w-full justify-center py-1"
        >
          {subscription?.status === "active"
            ? `${subscription.plan === "yearly" ? "Yearly" : "Monthly"} — Active`
            : "No active plan"}
        </Badge>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
            {pathname === href && <ChevronRight className="size-3 ml-auto" />}
          </Link>
        ))}

        {profile?.role === "admin" && (
          <>
            <Separator className="my-2" />
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <Separator />

      {/* User footer */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={profile?.avatar_url ?? ""} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{profile?.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
        </div>
        <Button
          variant="ghost" size="icon" className="shrink-0 size-8"
          onClick={handleLogout} disabled={loggingOut}
        >
          {loggingOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r flex-col shrink-0 bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 size-9 rounded-lg bg-card border flex items-center justify-center shadow"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-card border-r flex flex-col h-full shadow-xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
