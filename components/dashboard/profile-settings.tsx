"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, Upload } from "lucide-react";
import { useRef } from "react";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone:     z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProfileSettings({ profile }: { profile: any }) {
  const router   = useRouter();
  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? "", phone: profile?.phone ?? "" },
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.full_name, phone: data.phone ?? null })
      .eq("id", profile.id);

    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated!");
    router.refresh();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error ?? "Avatar upload failed");
      setUploading(false);
      return;
    }

    setAvatarUrl(json.avatar_url);
    toast.success("Avatar updated!");
    setUploading(false);
    router.refresh();
  };

  const initials = profile?.full_name
    ?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-[0_22px_50px_hsl(var(--foreground)/0.06)]">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your name, photo, and member-facing details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[1.7rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--accent)/0.1))] p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border border-border/60">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-2xl">{profile?.full_name ?? "Member"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile portrait</p>
              <Button
                variant="outline" size="sm" className="mt-2 gap-2 rounded-full"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                Change photo
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input {...register("full_name")} />
              {errors.full_name && <p className="text-destructive text-xs">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input {...register("phone")} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={profile?.email ?? ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
          <Button type="submit" disabled={!isDirty || isSubmitting} className="gap-2 rounded-full px-5">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
