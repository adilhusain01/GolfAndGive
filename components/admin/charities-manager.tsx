"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { charitySchema, type CharityInput } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Heart, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";

interface Props { charities: any[] }

export function CharitiesManager({ charities: initial }: Props) {
  const router    = useRouter();
  const supabase  = createClient();
  const [charities, setCharities] = useState(initial);
  const [formOpen, setFormOpen]   = useState(false);
  const [editItem, setEditItem]   = useState<any>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const form = useForm<CharityInput>({ resolver: zodResolver(charitySchema) });

  const openCreate = () => { setEditItem(null); form.reset({ is_featured: false, is_active: true }); setFormOpen(true); };
  const openEdit   = (c: any) => { setEditItem(c); form.reset(c); setFormOpen(true); };

  const onSubmit = async (data: CharityInput) => {
    setLoading(true);
    try {
      if (editItem) {
        const { data: updated, error } = await supabase
          .from("charities").update(data).eq("id", editItem.id).select().single();
        if (error) throw error;
        setCharities((prev) => prev.map((c) => c.id === editItem.id ? updated : c));
        toast.success("Charity updated!");
      } else {
        const { data: created, error } = await supabase
          .from("charities").insert(data).select().single();
        if (error) throw error;
        setCharities((prev) => [created, ...prev]);
        toast.success("Charity created!");
      }
      setFormOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("charities").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    setCharities((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    toast.success("Charity deleted.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Charities</h1>
          <p className="text-muted-foreground text-sm">{charities.length} registered charities</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" /> Add Charity
        </Button>
      </div>

      <div className="grid gap-3">
        {charities.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-4 flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {c.logo_url
                  ? <img src={c.logo_url} alt={c.name} className="size-9 rounded-full object-cover" />
                  : <Heart className="size-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{c.name}</p>
                  {c.is_featured && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Star className="size-3 text-amber-500" /> Featured
                    </Badge>
                  )}
                  <Badge variant={c.is_active ? "default" : "secondary"} className="text-xs">
                    {c.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(c)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteId(c.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {charities.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Heart className="size-10 mx-auto mb-3 opacity-30" />
              <p>No charities yet. Add one to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Charity" : "Add Charity"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input {...form.register("name")} placeholder="Charity name" />
                {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input {...form.register("slug")} placeholder="charity-slug" />
                {form.formState.errors.slug && <p className="text-destructive text-xs">{form.formState.errors.slug.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea {...form.register("description")} placeholder="Short description..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Logo URL</Label>
                <Input {...form.register("logo_url")} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Cover Image URL</Label>
                <Input {...form.register("cover_url")} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Website URL</Label>
              <Input {...form.register("website_url")} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={form.watch("is_featured")}
                  onCheckedChange={(v) => form.setValue("is_featured", v)}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={form.watch("is_active")}
                  onCheckedChange={(v) => form.setValue("is_active", v)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                {editItem ? "Save Changes" : "Create Charity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this charity?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the charity from the platform. Users who selected it will keep their existing subscription charity until they change it.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
