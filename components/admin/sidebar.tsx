"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  Trophy,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/admin",           icon: LayoutDashboard, label: "Overview"   },
  { href: "/admin/users",     icon: Users,           label: "Users"      },
  { href: "/admin/draws",     icon: Calendar,        label: "Draws"      },
  { href: "/admin/charities", icon: Heart,           label: "Charities"  },
  { href: "/admin/winners",   icon: Trophy,          label: "Winners"    },
  { href: "/admin/reports",   icon: BarChart3,       label: "Reports"    },
];

export function AdminSidebar({ profile: _profile }: { profile: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col">
      <div className="p-5">
        <div className="paper-panel overflow-hidden border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)/0.92))] p-4 shadow-[0_18px_50px_hsl(var(--foreground)/0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-primary text-primary-foreground shadow-[0_14px_28px_hsl(var(--primary)/0.28)]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-display text-xl leading-none">Operations</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Golf & Give
              </p>
            </div>
          </div>

          <div className="soft-rule my-4" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Access level
              </p>
              <p className="mt-2 text-sm font-medium">Admin controls enabled</p>
            </div>
            <Badge className="rounded-full">Live</Badge>
          </div>
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="section-label">Console</p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "border-primary/20 bg-primary text-primary-foreground shadow-[0_16px_36px_hsl(var(--primary)/0.26)]"
                : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
            <ChevronRight className="ml-auto size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-[1.4rem] border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronRight className="size-3.5 rotate-180" />
          Back to Dashboard
          <ArrowUpRight className="ml-auto size-3.5 opacity-60" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[300px] shrink-0 border-r border-border/70 bg-background/60 backdrop-blur-xl lg:flex">
        <SidebarContent />
      </aside>

      <button
        className="fixed left-4 top-5 z-50 flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/90 shadow-sm lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle admin navigation"
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      <div className="fixed inset-x-0 top-0 z-20 border-b border-border/70 bg-background/80 px-16 py-4 backdrop-blur-xl lg:hidden">
        <p className="section-label">Operations</p>
        <p className="mt-1 font-display text-2xl leading-none">Admin Console</p>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-20 px-4 lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-border/70 bg-card/90 p-2 shadow-[0_18px_40px_hsl(var(--foreground)/0.12)] backdrop-blur-xl">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="h-full w-[300px] border-r border-border/70 bg-background/95 shadow-xl backdrop-blur-xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
