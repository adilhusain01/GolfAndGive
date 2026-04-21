import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="size-3.5 text-primary-foreground" />
          </div>
          Golf & Give
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/charities" className="text-muted-foreground hover:text-foreground transition-colors">
            Charities
          </Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link href="/#prizes" className="text-muted-foreground hover:text-foreground transition-colors">
            Prizes
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
