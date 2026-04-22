"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { scoreSchema, type ScoreInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Target, Plus, Pencil, Trash2, Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface GolfScore {
  id:         string;
  score:      number;
  score_date: string;
}

interface Props {
  scores: GolfScore[];
  userId: string;
}

export function ScoreWidget({ scores: initialScores, userId }: Props) {
  const router    = useRouter();
  const supabase  = createClient();
  const [scores, setScores]       = useState(initialScores);
  const [addOpen, setAddOpen]     = useState(false);
  const [editScore, setEditScore] = useState<GolfScore | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ScoreInput>({
    resolver: zodResolver(scoreSchema),
    defaultValues: { score: undefined, score_date: format(new Date(), "yyyy-MM-dd") },
  });

  const editForm = useForm<ScoreInput>({ resolver: zodResolver(scoreSchema) });

  const avg = scores.length
    ? (scores.reduce((s, sc) => s + sc.score, 0) / scores.length).toFixed(1)
    : "—";

  const onAdd = async (data: ScoreInput) => {
    const { data: inserted, error } = await supabase
      .from("golf_scores")
      .insert({ user_id: userId, score: data.score, score_date: data.score_date })
      .select()
      .single();

    if (error) {
      toast.error(
        error.code === "23505"
          ? "You already have a score for this date. Edit or delete it first."
          : error.message
      );
      return;
    }

    toast.success("Score added!");
    setAddOpen(false);
    form.reset();
    startTransition(() => { router.refresh(); });
    // Optimistic: prepend & slice to 5
    setScores((prev) =>
      [inserted, ...prev.filter((s) => s.id !== inserted.id)].slice(0, 5)
    );
  };

  const onEdit = async (data: ScoreInput) => {
    if (!editScore) return;
    const { data: updated, error } = await supabase
      .from("golf_scores")
      .update({ score: data.score, score_date: data.score_date })
      .eq("id", editScore.id)
      .select()
      .single();

    if (error) { toast.error(error.message); return; }

    toast.success("Score updated!");
    setEditScore(null);
    setScores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("golf_scores").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }

    toast.success("Score removed.");
    setDeleteId(null);
    setScores((prev) => prev.filter((s) => s.id !== deleteId));
  };

  const openEdit = (sc: GolfScore) => {
    setEditScore(sc);
    editForm.reset({ score: sc.score, score_date: sc.score_date });
  };

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_22px_50px_hsl(var(--foreground)/0.06)]">
        <CardHeader className="border-b border-border/60 bg-[linear-gradient(180deg,hsl(var(--card)),transparent)]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                My Golf Scores
              </CardTitle>
              <CardDescription>
                Your latest 5 Stableford scores (1–45). New entries push out the oldest.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <TrendingUp className="size-3" /> Avg
                </div>
                <span className="font-display text-3xl text-primary">{avg}</span>
              </div>
              <Button
                size="sm" onClick={() => setAddOpen(true)}
                disabled={isPending}
                className="gap-1.5 rounded-full px-4"
              >
                <Plus className="size-4" />
                Add Score
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Scores retained",
                value: `${scores.length}/5`,
                note: scores.length === 5 ? "Ready for draw logic" : "Complete the five-score set",
              },
              {
                label: "Highest round",
                value: scores.length ? Math.max(...scores.map((score) => score.score)).toString() : "—",
                note: "Stableford points",
              },
              {
                label: "Average",
                value: avg,
                note: "Across retained rounds",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="mt-3 font-display text-3xl leading-none">{item.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="size-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No scores yet</p>
              <p className="text-sm">Add your first score to enter the monthly draw.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scores
                .slice()
                .sort((a, b) => b.score_date.localeCompare(a.score_date))
                .map((sc, i) => (
                  <div
                    key={sc.id}
                    className="flex items-center gap-3 rounded-[1.35rem] border border-border/70 bg-background/75 p-3 transition-colors hover:bg-background"
                  >
                    <Badge variant="outline" className="h-7 w-7 justify-center rounded-full p-0 text-xs font-bold">
                      {i + 1}
                    </Badge>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {format(new Date(sc.score_date), "dd MMM yyyy")}
                      </span>
                    </div>
                    <span className="font-display text-3xl text-primary">{sc.score}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">pts</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="size-7"
                        onClick={() => openEdit(sc)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="size-7 text-destructive"
                        onClick={() => setDeleteId(sc.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Score Dialog ─────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a score</DialogTitle>
            <DialogDescription>
              Enter your Stableford score (1–45) and the round date.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onAdd)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Score (1–45)</Label>
                <Input
                  type="number" min={1} max={45}
                  placeholder="e.g. 32"
                  {...form.register("score")}
                />
                {form.formState.errors.score && (
                  <p className="text-destructive text-xs">{form.formState.errors.score.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Round date</Label>
                <Input type="date" {...form.register("score_date")} />
                {form.formState.errors.score_date && (
                  <p className="text-destructive text-xs">{form.formState.errors.score_date.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                Save Score
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Score Dialog ────────────────────────── */}
      <Dialog open={!!editScore} onOpenChange={(o) => !o && setEditScore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit score</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Score (1–45)</Label>
                <Input type="number" min={1} max={45} {...editForm.register("score")} />
                {editForm.formState.errors.score && (
                  <p className="text-destructive text-xs">{editForm.formState.errors.score.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Round date</Label>
                <Input type="date" {...editForm.register("score_date")} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditScore(null)}>Cancel</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this score?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. You can re-add it if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
