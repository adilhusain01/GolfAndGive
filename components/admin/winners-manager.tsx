"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trophy, ExternalLink, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { getMonthLabel } from "@/lib/utils";

const STATUS_ICON: Record<string, any> = {
  pending:  { icon: Clock,        color: "text-amber-500" },
  paid:     { icon: CheckCircle,  color: "text-primary"   },
  rejected: { icon: XCircle,      color: "text-destructive" },
};

interface Props { winners: any[] }

export function WinnersManager({ winners: initial }: Props) {
  const router  = useRouter();
  const [winners, setWinners]   = useState(initial);
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes]       = useState("");
  const [newStatus, setNewStatus] = useState<"paid" | "rejected">("paid");
  const [loading, setLoading]   = useState(false);

  const pendingCount = winners.filter((w) => w.payment_status === "pending").length;

  const handleReview = async () => {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`/api/admin/winners/${selected.id}/review`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ payment_status: newStatus, admin_notes: notes }),
    });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error); setLoading(false); return; }

    toast.success(`Winner marked as ${newStatus}.`);
    setWinners((prev) =>
      prev.map((w) => w.id === selected.id ? { ...w, payment_status: newStatus, admin_notes: notes } : w)
    );
    setSelected(null);
    setNotes("");
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label">Payout Desk</p>
          <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Winners & Payouts</h1>
          <p className="mt-3 text-sm text-muted-foreground">{pendingCount} pending review</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="gap-1.5 rounded-full">
            <Clock className="size-3" /> {pendingCount} pending
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["pending", "paid", "rejected"].map((status) => {
          const count = winners.filter((w) => w.payment_status === status).length;
          const total = winners
            .filter((w) => w.payment_status === status)
            .reduce((s, w) => s + Number(w.prize_amount), 0);
          const { icon: Icon, color } = STATUS_ICON[status];
          return (
            <Card key={status} className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
              <CardContent className="pt-4">
                <div className={`flex items-center gap-2 mb-1 ${color}`}>
                  <Icon className="size-4" />
                  <span className="text-sm font-medium capitalize">{status}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">₹{total.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {["Winner", "Draw", "Tier", "Prize", "Status", "Proof", "Action"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {winners.map((w) => {
                const { icon: Icon, color } = STATUS_ICON[w.payment_status];
                return (
                  <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{w.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{w.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {w.draws?.draw_month && getMonthLabel(w.draws.draw_month)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs capitalize">{w.prize_tier}</Badge>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      ₹{Number(w.prize_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
                        <Icon className="size-3.5" />
                        <span className="capitalize">{w.payment_status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {w.proof_url ? (
                        <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                          className="text-primary flex items-center gap-1 text-xs hover:underline">
                          View <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {w.payment_status === "pending" ? (
                        <Button
                          size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => { setSelected(w); setNewStatus("paid"); setNotes(""); }}
                        >
                          Review
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {w.admin_notes ? "Has notes" : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {winners.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Trophy className="size-8 mx-auto mb-2 opacity-30" />
                    No winners yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Review dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Winner Payout</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/40 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Winner:</span> <strong>{selected.profiles?.full_name}</strong></p>
                <p><span className="text-muted-foreground">Prize:</span> <strong>₹{Number(selected.prize_amount).toLocaleString("en-IN")}</strong> ({selected.prize_tier})</p>
                <p><span className="text-muted-foreground">Draw:</span> {selected.draws?.draw_month && getMonthLabel(selected.draws.draw_month)}</p>
              </div>
              {selected.proof_url && (
                <div>
                  <Label className="text-xs text-muted-foreground">Submitted proof</Label>
                  <a href={selected.proof_url} target="_blank" rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="size-3.5" /> View screenshot
                  </a>
                </div>
              )}
              <Separator />
              <div className="space-y-1.5">
                <Label>Decision</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Approve & Mark Paid</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Admin notes (optional)</Label>
                <Textarea
                  placeholder="Reason for rejection, payment reference, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              onClick={handleReview} disabled={loading}
              variant={newStatus === "rejected" ? "destructive" : "default"}
            >
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Confirm {newStatus === "paid" ? "Payment" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
