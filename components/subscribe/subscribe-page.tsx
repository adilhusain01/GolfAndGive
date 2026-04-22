"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Check, Heart, Loader2, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "monthly",
    label: "Monthly",
    price: "₹499",
    period: "/month",
    desc: "A clean monthly cadence with full access to score entry and draw participation.",
    badge: null,
  },
  {
    key: "yearly",
    label: "Yearly",
    price: "₹4,799",
    period: "/year",
    desc: "The discounted annual route for members who want longer-term consistency.",
    badge: "Best value",
  },
] as const;

interface Props {
  charities: {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
  }[];
  pendingConfirmation?: boolean;
}

export function SubscribePage({
  charities,
  pendingConfirmation = false,
}: Props) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [charityId, setCharityId] = useState<string>(charities[0]?.id ?? "");
  const [pct, setPct] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!charityId && charities[0]?.id) {
      setCharityId(charities[0].id);
    }
  }, [charities, charityId]);

  const currentPlan = PLANS.find((entry) => entry.key === plan) ?? PLANS[0];
  const charityAmt =
    plan === "yearly"
      ? ((4799 * pct) / 100).toFixed(0)
      : ((499 * pct) / 100).toFixed(0);

  const handleSubscribe = async () => {
    if (!charityId) {
      toast.error("Please select a charity first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          charity_id: charityId,
          charity_percentage: pct,
        }),
      });
      const json = await res.json();
      if (res.status === 401) {
        window.location.href = "/login?next=%2Fsubscribe";
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "Failed to create checkout");
      window.location.href = json.url;
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="paper-panel rounded-[2.5rem] border border-border/70 px-6 py-8 md:px-8 md:py-10">
          <span className="section-label mb-5">
            <Sparkles className="size-3.5" />
            Membership design
          </span>
          <h1 className="editorial-kicker max-w-xl">
            Join the score-led giving cycle.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">
            Membership combines score retention, monthly draw eligibility, and a
            charity destination that stays attached to each billing cycle.
          </p>

          {pendingConfirmation && (
            <Card className="mt-6 border-primary/30 bg-primary/5">
              <CardContent className="pt-6 text-sm leading-7 text-muted-foreground">
                Payment completed. We&apos;re waiting for the subscription webhook to
                activate your account. This usually takes a moment.
              </CardContent>
            </Card>
          )}

          <div className="mt-8 grid gap-4">
            {[
              {
                icon: Trophy,
                title: "Prize draw participation",
                copy: "Retained scores feed into the monthly published draw once all five slots are present.",
              },
              {
                icon: Heart,
                title: "Charity percentage control",
                copy: "Start at 10% and push far beyond it if you want more of the subscription directed outward.",
              },
              {
                icon: ShieldCheck,
                title: "Managed subscription lifecycle",
                copy: "Activation, renewal, cancellation, and draw access are tied to the backend lifecycle rules.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div
                key={title}
                className="rounded-[1.6rem] border border-border/60 bg-background/70 px-4 py-4"
              >
                <Icon className="size-4 text-primary" />
                <p className="mt-3 font-medium">{title}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="paper-panel rounded-[2.5rem] border border-border/70 px-6 py-8 md:px-8 md:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="section-label mb-5">Configure membership</span>
              <h2 className="font-display text-4xl">Choose a plan and a cause.</h2>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Secure checkout
            </Badge>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PLANS.map((entry) => (
              <Card
                key={entry.key}
                onClick={() => setPlan(entry.key)}
                className={cn(
                  "cursor-pointer border border-border/70 bg-background/70 transition-all duration-200",
                  plan === entry.key && "border-primary shadow-[0_16px_30px_hsl(var(--primary)/0.12)]",
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="font-display text-3xl">
                      {entry.label}
                    </CardTitle>
                    {entry.badge && <Badge>{entry.badge}</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">
                    {entry.price}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {entry.period}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {entry.desc}
                  </p>
                  {plan === entry.key && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                      <Check className="size-3.5" />
                      Selected
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-end justify-between gap-3">
              <Label className="text-base font-semibold">Choose your charity</Label>
              <p className="text-xs text-muted-foreground">
                {charities.length} active options
              </p>
            </div>

            {charities.length === 0 ? (
              <div className="rounded-[1.6rem] border border-border bg-muted p-6 text-sm text-muted-foreground">
                No active charities are available right now. Please check back later.
              </div>
            ) : (
              <div className="grid gap-3">
                {charities.map((charity) => (
                  <div
                    key={charity.id}
                    onClick={() => setCharityId(charity.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border/70 bg-background/70 px-4 py-4 transition-all duration-200",
                      charityId === charity.id &&
                        "border-primary bg-primary/[0.04] shadow-[0_14px_28px_hsl(var(--primary)/0.08)]",
                    )}
                  >
                    <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/8">
                      {charity.logo_url ? (
                        <Image
                          src={charity.logo_url}
                          alt={charity.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Heart className="size-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{charity.name}</p>
                      {charity.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-7 text-muted-foreground">
                          {charity.description}
                        </p>
                      )}
                    </div>
                    {charityId === charity.id && (
                      <div className="rounded-full bg-primary px-2 py-2 text-primary-foreground">
                        <Check className="size-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 rounded-[2rem] border border-border/70 bg-background/70 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-base font-semibold">Charity contribution</Label>
              <p className="font-display text-4xl leading-none text-primary">{pct}%</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Your current selection routes approximately ₹{charityAmt} from the {currentPlan.label.toLowerCase()} plan toward the chosen charity.
            </p>
            <Slider
              min={10}
              max={100}
              step={5}
              value={pct}
              onChange={(event) => setPct(Number(event.target.value))}
              className="mt-5 py-2"
            />
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>Minimum 10%</span>
              <span>Maximum 100%</span>
            </div>
          </div>

          <Button
            size="lg"
            className="mt-8 w-full text-base"
            onClick={handleSubscribe}
            disabled={loading || !charityId}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Continue to checkout · {currentPlan.price}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Secure checkout via DodoPayments. Membership can be cancelled from the account area.
          </p>
        </div>
      </div>
    </main>
  );
}
