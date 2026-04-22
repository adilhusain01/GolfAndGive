import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Heart, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-border/80 bg-background/92 px-4 shadow-[0_10px_40px_hsl(167_30%_16%/0.14)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_20px_hsl(var(--primary)/0.2)]">
            <Heart className="size-4" />
          </div>
          <div>
            <p className="font-display text-2xl leading-none">Golf & Give</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Membership for impact
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/charities" className="text-muted-foreground transition-colors hover:text-foreground">
            Charities
          </Link>
          <Link href="/#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/#prizes" className="text-muted-foreground transition-colors hover:text-foreground">
            Prizes
          </Link>
          <Link href="/subscribe" className="text-muted-foreground transition-colors hover:text-foreground">
            Membership
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button size="sm" asChild className="pl-4">
              <Link href="/dashboard">
                Dashboard
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="pl-4">
                <Link href="/signup">
                  Join now
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
