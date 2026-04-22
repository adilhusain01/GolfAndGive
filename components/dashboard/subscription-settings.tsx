"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, Loader2, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function SubscriptionSettings({ subscription }: { subscription: any }) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [loading, setLoading]       = useState(false);

  const isActive = subscription?.status === "active";

  const handleCancel = async () => {
    setLoading(true);
    const res = await fetch("/api/payments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: subscription?.dodo_subscription_id }),
    });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error ?? "Failed to cancel"); setLoading(false); return; }
    toast.success("Subscription cancelled. Access continues until period end.");
    setCancelOpen(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_22px_50px_hsl(var(--foreground)/0.06)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4" /> Subscription
          </CardTitle>
          <CardDescription>Manage your plan and billing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="rounded-[1.7rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--accent)/0.1))] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-2xl capitalize">{subscription.plan} plan</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.amount_pence
                        ? `₹${(subscription.amount_pence / 100).toLocaleString("en-IN")}`
                        : "—"}
                      {subscription.plan === "yearly" ? "/year" : "/month"}
                    </p>
                  </div>
                  <Badge variant={isActive ? "default" : "secondary"} className="capitalize rounded-full">
                    {subscription.status}
                  </Badge>
                </div>

                {subscription.current_period_end && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    {isActive
                      ? `Renews on ${formatDate(subscription.current_period_end)}`
                      : `Access until ${formatDate(subscription.current_period_end)}`}
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charity contribution</span>
                    <span className="font-medium">{subscription.charity_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DodoPayments subscription ID</span>
                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">
                      {subscription.dodo_subscription_id ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              {isActive && (
                <Button
                  variant="outline"
                  className="gap-2 rounded-full border-destructive/30 text-destructive hover:bg-destructive/5"
                  onClick={() => setCancelOpen(true)}
                >
                  <AlertTriangle className="size-4" />
                  Cancel subscription
                </Button>
              )}

              {!isActive && (
                <Button asChild>
                  <a href="/subscribe">Resubscribe</a>
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-3 py-6 text-center">
              <p className="text-muted-foreground text-sm">No active subscription found.</p>
              <Button asChild>
                <a href="/subscribe">Subscribe now</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until{" "}
              <strong>{subscription?.current_period_end && formatDate(subscription.current_period_end)}</strong>.
              After that, you'll lose access to draws and score tracking.
              Your charity contributions already made will not be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
