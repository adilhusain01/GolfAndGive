"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2 } from "lucide-react";

export function DonationCard({
  charityId,
  charityName,
}: {
  charityId: string;
  charityName: string;
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    donor_name: "",
    donor_email: "",
    amount_rupees: "1000",
    message: "",
  });

  const donationSuccess = searchParams.get("donation") === "success";

  const handleDonate = async () => {
    setLoading(true);
    try {
      const amount_pence = Math.round(Number(form.amount_rupees) * 100);
      const res = await fetch("/api/donations/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charity_id: charityId,
          donor_name: form.donor_name,
          donor_email: form.donor_email,
          amount_pence,
          message: form.message,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Could not start donation");
      }
      window.location.href = json.url;
    } catch (error: any) {
      toast.error(error.message ?? "Donation checkout failed");
      setLoading(false);
    }
  };

  return (
    <Card className="border-rose-200/70 bg-gradient-to-b from-rose-50/70 to-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Donate directly</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {donationSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Donation completed successfully. A receipt will arrive by email if delivery is configured.
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Support {charityName} with a one-time donation, even if you are not subscribing to the platform.
        </p>

        <div className="space-y-1.5">
          <Label>Your name</Label>
          <Input
            value={form.donor_name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, donor_name: event.target.value }))
            }
            placeholder="Full name"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.donor_email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, donor_email: event.target.value }))
            }
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Amount (INR)</Label>
          <Input
            type="number"
            min={10}
            step={1}
            value={form.amount_rupees}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, amount_rupees: event.target.value }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Message (optional)</Label>
          <Textarea
            rows={3}
            value={form.message}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, message: event.target.value }))
            }
            placeholder="A short note for your donation record"
          />
        </div>

        <Button className="w-full gap-2" onClick={handleDonate} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
          Donate now
        </Button>
      </CardContent>
    </Card>
  );
}
