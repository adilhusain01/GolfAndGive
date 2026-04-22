import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="px-4 pb-10 pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="paper-panel rounded-[2rem] border border-border/70 px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="mb-5 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Heart className="size-4" />
                </div>
                <div>
                  <p className="font-display text-2xl leading-none">Golf & Give</p>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Play with consequence
                  </p>
                </div>
              </Link>
              <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                A charitable membership platform that turns scorekeeping into recurring support, prize momentum, and a more generous kind of competition.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                <ArrowUpRight className="size-3" />
                Payments secured by DodoPayments
              </div>
            </div>

            {[
              {
                title: "Explore",
                links: [
                  { href: "/", label: "Home" },
                  { href: "/charities", label: "Charities" },
                  { href: "/subscribe", label: "Membership" },
                ],
              },
              {
                title: "Account",
                links: [
                  { href: "/signup", label: "Create account" },
                  { href: "/login", label: "Sign in" },
                  { href: "/dashboard", label: "Dashboard" },
                ],
              },
              {
                title: "Mission",
                links: [
                  { href: "/#how-it-works", label: "How it works" },
                  { href: "/#prizes", label: "Prize model" },
                  { href: "/charities", label: "Partner charities" },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {title}
                </p>
                <ul className="space-y-3">
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-foreground/86 transition-colors hover:text-primary">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-8" />
          <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Golf & Give. Built for recurring charitable impact.</p>
            <p>Scores, subscriptions, draws, and giving are managed inside one platform.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
