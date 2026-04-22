"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Upload, CheckCircle, Loader2, ImageIcon } from "lucide-react";
import { getMonthLabel } from "@/lib/utils";

interface Props {
  winners: any[];
}

export function ProofUpload({ winners }: Props) {
  const router   = useRouter();
  const [uploading, setUploading] = useState<string | null>(null); // winner id being uploaded

  const handleUpload = async (winnerId: string, file: File) => {
    setUploading(winnerId);
    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch(`/api/winners/${winnerId}/proof`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error ?? "Could not submit proof");
      setUploading(null);
      return;
    }

    toast.success("Proof submitted! An admin will review it shortly.");
    setUploading(null);
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Submit Winner Proof</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload a screenshot from your golf platform showing your scores to claim your prize.
        </p>
      </div>

      {winners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="size-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No pending prizes</p>
            <p className="text-sm mt-1">All your winnings are either verified or there are none yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {winners.map((w) => (
            <ProofCard
              key={w.id}
              winner={w}
              uploading={uploading === w.id}
              onUpload={(file) => handleUpload(w.id, file)}
            />
          ))}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">What to upload</CardTitle>
          <CardDescription>Your proof screenshot must clearly show:</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <p>✓ Your name or username on the golf platform</p>
          <p>✓ Your scores matching your entries for the draw period</p>
          <p>✓ The date each score was recorded</p>
          <p>✓ The score must be from a recognised golf platform</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProofCard({
  winner, uploading, onUpload,
}: {
  winner:   any;
  uploading: boolean;
  onUpload:  (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hasProof = !!winner.proof_url;

  return (
    <Card className={hasProof ? "border-primary/40" : ""}>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="size-4 text-amber-500" />
              <span className="font-semibold capitalize">{winner.prize_tier}</span>
              <Badge variant="outline" className="text-xs">
                ₹{Number(winner.prize_amount).toLocaleString("en-IN")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {winner.draws?.draw_month && getMonthLabel(winner.draws.draw_month)} draw
            </p>
          </div>
          {hasProof && (
            <div className="flex items-center gap-1 text-primary text-xs font-medium">
              <CheckCircle className="size-3.5" /> Proof submitted
            </div>
          )}
        </div>

        {hasProof ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
            <ImageIcon className="size-4 text-muted-foreground" />
            <a
              href={winner.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View submitted proof
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 text-xs"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <Loader2 className="size-4 animate-spin" />
              : <Upload className="size-4" />}
            {uploading ? "Uploading…" : "Upload screenshot"}
          </Button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </CardContent>
    </Card>
  );
}
