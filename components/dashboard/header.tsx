import { formatDate } from "@/lib/utils";
import { Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function DashboardHeader({ profile }: { profile: any }) {
  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name  = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[88px] w-full max-w-7xl items-center justify-between gap-4 px-16 py-4 max-lg:px-4 sm:px-6">
        <div className="min-w-0">
          <p className="section-label">Member Console</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl leading-none text-foreground sm:text-3xl">
              {greet}, {name}
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              {formatDate(new Date())}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9 rounded-full border border-border/60 bg-card/70 relative">
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
