"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { drawCreateSchema, drawPublishSchema, type DrawCreateInput, type DrawPublishInput } from "@/lib/validations";
import { splitPrizePool } from "@/lib/dodo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Send, Loader2, Shuffle, Trophy, Zap } from "lucide-react";
import { getMonthLabel } from "@/lib/utils";

interface Props {
  draws:             any[];
  activeSubscribers: any[];
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "secondary",
  simulation: "outline",
  published:  "default",
};

export function DrawManager({ draws: initialDraws, activeSubscribers }: Props) {
  const router  = useRouter();
  const [draws, setDraws]           = useState(initialDraws);
  const [createOpen, setCreateOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<any>(null);
  const [loading, setLoading]       = useState(false);

  // Calculate total prize pool from active subs
  const totalPool = activeSubscribers.reduce((sum, sub) => {
    const amount = sub.amount_pence / 100;
    const pct    = sub.charity_percentage / 100;
    const pool   = amount * (1 - pct - 0.10);
    return sum + pool;
  }, 0);

  const poolSplit = splitPrizePool(totalPool);

  const createForm = useForm<DrawCreateInput>({
    resolver: zodResolver(drawCreateSchema),
    defaultValues: { draw_month: format(new Date(), "yyyy-MM-01"), logic: "random" },
  });

  const publishForm = useForm<DrawPublishInput>({
    resolver: zodResolver(drawPublishSchema),
  });

  const handleCreate = async (data: DrawCreateInput) => {
    setLoading(true);
    const res = await fetch("/api/admin/draws", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, jackpot_amount: poolSplit.jackpot, pool_4match: poolSplit.match4, pool_3match: poolSplit.match3 }),
    });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error); setLoading(false); return; }
    toast.success("Draw created!");
    setCreateOpen(false);
    setDraws((prev) => [json.draw, ...prev]);
    setLoading(false);
    router.refresh();
  };

  const handleSimulate = async (draw: any) => {
    setLoading(true);
    const res = await fetch(`/api/admin/draws/${draw.id}/simulate`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error); setLoading(false); return; }
    toast.success("Simulation complete! Review before publishing.");
    setSelectedDraw({ ...draw, status: "simulation", winning_numbers: json.numbers });
    setPublishOpen(true);
    publishForm.reset({ draw_id: draw.id, winning_numbers: json.numbers });
    setDraws((prev) => prev.map((d) => (d.id === draw.id ? { ...d, status: "simulation" } : d)));
    setLoading(false);
  };

  const handlePublish = async (data: DrawPublishInput) => {
    setLoading(true);
    const res = await fetch(`/api/admin/draws/${data.draw_id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winning_numbers: data.winning_numbers }),
    });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error); setLoading(false); return; }
    toast.success("Draw published! Winners calculated.");
    setPublishOpen(false);
    setDraws((prev) =>
      prev.map((d) => (d.id === data.draw_id ? { ...d, status: "published", winning_numbers: data.winning_numbers } : d))
    );
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label">Lottery Operations</p>
          <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Draw Management</h1>
          <p className="mt-3 text-sm text-muted-foreground">Create, simulate and publish monthly draws.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-full px-5">
          <Calendar className="size-4" /> New Draw
        </Button>
      </div>

      <Card className="border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--accent)/0.1))] shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="size-4 text-amber-500" /> Current Prize Pool ({activeSubscribers.length} active subs)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Jackpot (5-match)", value: poolSplit.jackpot, color: "text-amber-500" },
            { label: "4-Match",           value: poolSplit.match4,  color: "text-primary"  },
            { label: "3-Match",           value: poolSplit.match3,  color: "text-blue-400" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold ${color}`}>₹{value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Draws list */}
      <div className="space-y-3">
        {draws.length === 0 ? (
          <Card className="border-border/70 bg-card/85">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="size-10 mx-auto mb-3 opacity-30" />
              <p>No draws yet. Create your first one.</p>
            </CardContent>
          </Card>
        ) : (
          draws.map((draw) => (
            <Card key={draw.id} className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{getMonthLabel(draw.draw_month)}</p>
                    <Badge variant={STATUS_COLORS[draw.status] as any}>
                      {draw.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {draw.logic}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jackpot: ₹{Number(draw.jackpot_amount).toLocaleString("en-IN")}
                    {draw.jackpot_rolled && " (rolled over)"}
                  </p>
                  {draw.winning_numbers?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {draw.winning_numbers.map((n: number, i: number) => (
                        <span key={i} className="size-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {draw.status === "pending" && (
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => handleSimulate(draw)} disabled={loading}
                    >
                      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Shuffle className="size-3.5" />}
                      Simulate
                    </Button>
                  )}
                  {draw.status === "simulation" && (
                    <Button size="sm" className="gap-1.5"
                      onClick={() => {
                        setSelectedDraw(draw);
                        publishForm.reset({ draw_id: draw.id, winning_numbers: draw.winning_numbers });
                        setPublishOpen(true);
                      }}
                    >
                      <Send className="size-3.5" /> Publish
                    </Button>
                  )}
                  {draw.status === "published" && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="size-3.5 text-primary" /> Published
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create draw dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Draw</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Draw month (first of month)</Label>
              <Input type="date" {...createForm.register("draw_month")} />
            </div>
            <div className="space-y-1.5">
              <Label>Draw logic</Label>
              <Select
                defaultValue="random"
                onValueChange={(v) => createForm.setValue("logic", v as any)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random — standard lottery</SelectItem>
                  <SelectItem value="algorithmic">Algorithmic — weighted by score frequency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Publish dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Draw — {selectedDraw && getMonthLabel(selectedDraw.draw_month)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={publishForm.handleSubmit(handlePublish)} className="space-y-4">
            <div className="space-y-2">
              <Label>Winning numbers (5 numbers, 1–45)</Label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Input
                    key={i} type="number" min={1} max={45}
                    className="text-center font-bold"
                    {...publishForm.register(`winning_numbers.${i}`)}
                  />
                ))}
              </div>
              {publishForm.formState.errors.winning_numbers && (
                <p className="text-destructive text-xs">All 5 numbers are required (1–45).</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Publishing will calculate all winners, split prizes, and notify eligible subscribers.
              This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setPublishOpen(false)}>Back</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Publish Draw
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
