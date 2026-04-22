"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Heart, Check, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  subscription: any;
  charities: any[];
}

export function CharitySettings({ subscription, charities }: Props) {
  const router = useRouter();

  const [charityId, setCharityId] = useState<string>(
    subscription?.selected_charity_id ?? "",
  );
  const [pct, setPct] = useState<number>(
    subscription?.charity_percentage ?? 10,
  );
  const [loading, setLoading] = useState(false);

  const isDirty =
    charityId !== subscription?.selected_charity_id ||
    pct !== subscription?.charity_percentage;

  const handleSave = async () => {
    if (!subscription) return;
    setLoading(true);
    const res = await fetch("/api/subscription/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charity_id: charityId,
        charity_percentage: pct,
      }),
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error ?? "Could not update charity preference");
      setLoading(false);
      return;
    }

    toast.success("Charity preference updated!");
    router.refresh();
    setLoading(false);
  };

  if (!subscription) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Heart className="size-10 mx-auto mb-3 opacity-30" />
        <p>You need an active subscription to select a charity.</p>
        <Button className="mt-4" asChild>
          <a href="/subscribe">Subscribe now</a>
        </Button>
      </div>
    );
  }

  const monthlyTotal = subscription?.plan === "yearly" ? 4799 / 12 : 499;
  const charityAmt = ((monthlyTotal * pct) / 100).toFixed(0);

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in">
      <div>
        <p className="section-label">Giving Preferences</p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">My Charity</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Choose where your contribution goes each month.
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_22px_50px_hsl(var(--foreground)/0.06)]">
        <CardHeader>
          <CardTitle>Select a charity</CardTitle>
          <CardDescription>
            Changing your charity takes effect from the next billing cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {charities.map((c) => (
            <div
              key={c.id}
              onClick={() => setCharityId(c.id)}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-[1.5rem] border p-4 transition-all",
                charityId === c.id
                  ? "border-primary bg-primary/6 shadow-[0_16px_36px_hsl(var(--primary)/0.18)]"
                  : "border-border/80 bg-background/70 hover:border-primary/40",
              )}
            >
              <div className="relative size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {c.logo_url ? (
                  <Image
                    src={c.logo_url}
                    alt={c.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
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
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_22px_50px_hsl(var(--foreground)/0.06)]">
        <CardHeader>
          <CardTitle>Contribution percentage</CardTitle>
          <CardDescription>
            Minimum 10%. Any increase comes from your subscription amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Your contribution</Label>
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl text-primary">{pct}%</span>
              <Badge variant="outline" className="rounded-full">≈ ₹{charityAmt}/mo</Badge>
            </div>
          </div>
          <Slider
            min={10}
            max={100}
            step={5}
            value={pct}
            onChange={(event) => setPct(Number(event.target.value))}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10% (minimum)</span>
            <span>100% (full donation)</span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={!isDirty || loading}
        className="w-full gap-2 rounded-full sm:w-auto sm:px-6"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Save changes
      </Button>
    </div>
  );
}
