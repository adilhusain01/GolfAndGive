import Link from "next/link";
import { Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-card py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                <Heart className="size-3 text-primary-foreground" />
              </div>
              Golf & Give
            </Link>
            <p className="text-sm text-muted-foreground">
              Golf performance tracking, monthly prizes, and charitable giving — all in one platform.
            </p>
          </div>
          {[
            {
              title: "Platform",
              links: [
                { href: "/",          label: "Home"       },
                { href: "/charities", label: "Charities"  },
                { href: "/subscribe", label: "Subscribe"  },
                { href: "/dashboard", label: "Dashboard"  },
              ],
            },
            {
              title: "Account",
              links: [
                { href: "/signup",              label: "Sign Up"        },
                { href: "/login",               label: "Sign In"        },
                { href: "/dashboard/settings",  label: "Settings"       },
              ],
            },
            {
              title: "Legal",
              links: [
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms",   label: "Terms of Use"   },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <p className="text-sm font-semibold mb-3">{title}</p>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator />
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Golf & Give. All rights reserved.</p>
          <p>Payments secured by DodoPayments · Data stored on Supabase</p>
        </div>
      </div>
    </footer>
  );
}
