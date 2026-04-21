import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function DashboardHeader({ profile }: { profile: any }) {
  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name  = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-sm">
      <p className="text-sm text-muted-foreground hidden sm:block">
        {greet}, <span className="text-foreground font-medium">{name}</span> 👋
      </p>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="size-8 relative">
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
