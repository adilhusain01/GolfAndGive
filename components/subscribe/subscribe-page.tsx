"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Check, Heart, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "monthly",
    label: "Monthly",
    price: "₹499",
    period: "/month",
    desc: "Billed monthly. Cancel anytime.",
    badge: null,
  },
  {
    key: "yearly",
    label: "Yearly",
    price: "₹4,799",
    period: "/year",
    desc: "Save ~20% vs monthly.",
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
}

export function SubscribePage({ charities }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [charityId, setCharityId] = useState<string>("");
  const [pct, setPct] = useState(10);
  const [loading, setLoading] = useState(false);

  const monthlyEq = plan === "yearly" ? (4799 / 12).toFixed(0) : "499";
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
      if (!res.ok) throw new Error(json.error ?? "Failed to create checkout");
      window.location.href = json.url;
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose your plan</h1>
        <p className="text-muted-foreground mt-2">
          One subscription. Prizes, golf tracking, and charity impact.
        </p>
      </div>

      {/* ── Plan picker ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {PLANS.map((p) => (
          <Card
            key={p.key}
            onClick={() => setPlan(p.key)}
            className={cn(
              "cursor-pointer transition-all border-2",
              plan === p.key ? "border-primary" : "border-transparent",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{p.label}</CardTitle>
                {p.badge && <Badge className="text-xs">{p.badge}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {p.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {p.period}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
              {plan === p.key && (
                <div className="mt-2 flex items-center gap-1 text-primary text-xs font-medium">
                  <Check className="size-3.5" /> Selected
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What's included */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            { icon: Trophy, text: "Monthly prize draws" },
            { icon: Zap, text: "Score tracking & history" },
            { icon: Heart, text: "Charity contribution" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Icon className="size-4 text-primary" /> {text}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Charity selector ──────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Choose your charity</Label>
        <div className="grid gap-2">
          {charities.map((c) => (
            <div
              key={c.id}
              onClick={() => setCharityId(c.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                charityId === c.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {c.logo_url ? (
                  <img
                    src={c.logo_url}
                    alt={c.name}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <Heart className="size-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.name}</p>
                {c.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {c.description}
                  </p>
                )}
              </div>
              {charityId === c.id && (
                <Check className="size-4 text-primary shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Charity % slider ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">
            Charity contribution
          </Label>
          <span className="text-primary font-bold text-lg">{pct}%</span>
        </div>
        <Slider
          min={10}
          max={100}
          step={5}
          value={pct}
          onChange={(event) => setPct(Number(event.target.value))}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min 10%</span>
          <span>₹{charityAmt} goes to your charity</span>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────── */}
      <Button
        size="lg"
        className="w-full text-base h-12"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
        Subscribe {plan === "yearly" ? "Yearly · ₹4,799" : "Monthly · ₹499"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Secure checkout via DodoPayments. Cancel anytime.
      </p>
    </div>
  );
}
