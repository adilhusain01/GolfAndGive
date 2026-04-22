"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, Heart, Trophy, BarChart3, ShieldCheck, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

  return (
    <aside className="w-60 border-r bg-card flex flex-col shrink-0">
      <div className="p-5 flex items-center gap-2.5">
        <div className="size-8 rounded-xl bg-primary flex items-center justify-center">
          <ShieldCheck className="size-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">Admin Panel</p>
          <p className="text-xs text-muted-foreground">Golf & Give</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <Separator />
      <div className="p-4">
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ChevronRight className="size-3 rotate-180" /> Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}
