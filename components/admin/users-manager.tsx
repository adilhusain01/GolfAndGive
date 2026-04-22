"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Search, ShieldCheck, Target, UserCog, Wallet } from "lucide-react";
import { PLANS } from "@/lib/dodo/client";

type UserRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  subscription?: {
    plan?: string | null;
    status?: string | null;
    current_period_end?: string | null;
  } | null;
};

type CharityOption = {
  id: string;
  name: string;
  is_active?: boolean | null;
};

type ManagedScore = {
  id: string;
  score: number;
  score_date: string;
  created_at?: string | null;
};

type ManagedUserResponse = {
  user: {
    id: string;
    full_name?: string | null;
    email?: string | null;
    role?: string | null;
    phone?: string | null;
    country?: string | null;
    created_at?: string | null;
  };
  subscription: {
    id: string;
    plan?: "monthly" | "yearly" | null;
    status?: "active" | "inactive" | "cancelled" | "lapsed" | null;
    charity_percentage?: number | null;
    selected_charity_id?: string | null;
    current_period_end?: string | null;
    amount_pence?: number | null;
    currency?: string | null;
    dodo_subscription_id?: string | null;
    created_at?: string | null;
  } | null;
  scores: ManagedScore[];
};

type Props = {
  users: UserRow[];
  charities: CharityOption[];
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function UsersManager({ users: initialUsers, charities }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [deletingScoreId, setDeletingScoreId] = useState<string | null>(null);
  const [managed, setManaged] = useState<ManagedUserResponse | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    role: "subscriber",
    phone: "",
    country: "IN",
  });
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: "monthly",
    status: "inactive",
    charity_percentage: "10",
    selected_charity_id: "",
    current_period_end: "",
  });
  const [scoreForm, setScoreForm] = useState({
    id: "",
    score: "",
    score_date: format(new Date(), "yyyy-MM-dd"),
  });

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.full_name, user.email, user.role]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [query, users]);

  const summary = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    const active = users.filter((user) => user.subscription?.status === "active").length;
    const withoutSubscription = users.filter((user) => !user.subscription).length;
    return {
      total: users.length,
      admins,
      active,
      withoutSubscription,
    };
  }, [users]);

  const openManage = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load user");
      }

      setManaged(json);
      setProfileForm({
        full_name: json.user.full_name ?? "",
        role: json.user.role ?? "subscriber",
        phone: json.user.phone ?? "",
        country: json.user.country ?? "IN",
      });
      setSubscriptionForm({
        plan: json.subscription?.plan ?? "monthly",
        status: json.subscription?.status ?? "inactive",
        charity_percentage: String(json.subscription?.charity_percentage ?? 10),
        selected_charity_id: json.subscription?.selected_charity_id ?? "",
        current_period_end: toDateInput(json.subscription?.current_period_end),
      });
      setScoreForm({
        id: "",
        score: "",
        score_date: format(new Date(), "yyyy-MM-dd"),
      });
    } catch (error: any) {
      toast.error(error.message ?? "Failed to load user");
      setSelectedUserId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const syncUserRow = (nextUser: ManagedUserResponse["user"], nextSubscription: ManagedUserResponse["subscription"]) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === nextUser.id
          ? {
              ...user,
              full_name: nextUser.full_name,
              email: nextUser.email,
              role: nextUser.role,
              subscription: nextSubscription
                ? {
                    plan: nextSubscription.plan,
                    status: nextSubscription.status,
                    current_period_end: nextSubscription.current_period_end,
                  }
                : null,
            }
          : user,
      ),
    );
  };

  const handleProfileSave = async () => {
    if (!managed?.user.id) return;
    setSavingProfile(true);

    try {
      const res = await fetch(`/api/admin/users/${managed.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to update user");
      }

      const nextManaged = {
        ...managed,
        user: json.user,
      };
      setManaged(nextManaged);
      syncUserRow(json.user, managed.subscription);
      toast.success("User profile updated.");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update user");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubscriptionSave = async () => {
    if (!managed?.user.id || !managed.subscription) return;
    setSavingSubscription(true);

    try {
      const res = await fetch(`/api/admin/users/${managed.user.id}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...subscriptionForm,
          charity_percentage: Number(subscriptionForm.charity_percentage),
          selected_charity_id: subscriptionForm.selected_charity_id || null,
          current_period_end: subscriptionForm.current_period_end || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to update subscription");
      }

      const nextManaged = {
        ...managed,
        subscription: json.subscription,
      };
      setManaged(nextManaged);
      syncUserRow(managed.user, json.subscription);
      toast.success("Subscription updated.");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update subscription");
    } finally {
      setSavingSubscription(false);
    }
  };

  const resetScoreForm = () => {
    setScoreForm({
      id: "",
      score: "",
      score_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleScoreSubmit = async () => {
    if (!managed?.user.id) return;
    if (!scoreForm.score || !scoreForm.score_date) {
      toast.error("Score and date are required.");
      return;
    }

    setScoreSubmitting(true);

    try {
      const endpoint = scoreForm.id
        ? `/api/admin/users/${managed.user.id}/scores/${scoreForm.id}`
        : `/api/admin/users/${managed.user.id}/scores`;
      const method = scoreForm.id ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(scoreForm.score),
          score_date: scoreForm.score_date,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.error ??
            "Failed to save score. Check duplicate dates and score range.",
        );
      }

      const nextScores = scoreForm.id
        ? (managed.scores ?? []).map((score) =>
            score.id === json.score.id ? json.score : score,
          )
        : [json.score, ...(managed.scores ?? [])]
            .sort((a, b) => b.score_date.localeCompare(a.score_date))
            .slice(0, 5);

      setManaged({
        ...managed,
        scores: nextScores,
      });
      resetScoreForm();
      toast.success(scoreForm.id ? "Score updated." : "Score added.");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to save score");
    } finally {
      setScoreSubmitting(false);
    }
  };

  const handleDeleteScore = async () => {
    if (!managed?.user.id || !deletingScoreId) return;
    setScoreSubmitting(true);

    try {
      const res = await fetch(
        `/api/admin/users/${managed.user.id}/scores/${deletingScoreId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to delete score");
      }

      setManaged({
        ...managed,
        scores: managed.scores.filter((score) => score.id !== deletingScoreId),
      });
      if (scoreForm.id === deletingScoreId) {
        resetScoreForm();
      }
      setDeletingScoreId(null);
      toast.success("Score deleted.");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to delete score");
    } finally {
      setScoreSubmitting(false);
    }
  };

  const selectedCharity = charities.find(
    (charity) => charity.id === subscriptionForm.selected_charity_id,
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-label">Identity Desk</p>
          <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">User Control</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage subscriber identity, access state, and draw eligibility from one place.
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or role"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: summary.total, note: "Profiles loaded" },
          { label: "Active subs", value: summary.active, note: "Current active lifecycle" },
          { label: "Admins", value: summary.admins, note: "Elevated access" },
          { label: "No subscription", value: summary.withoutSubscription, note: "Needs setup or recovery" },
        ].map((item) => (
          <Card key={item.label} className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
              <p className="mt-3 font-display text-3xl leading-none">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden border-border/70 bg-card/85 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{user.full_name || "Unnamed user"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="rounded-full">
                  {user.role}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Subscription</p>
                  <p className="mt-2 font-medium capitalize">
                    {user.subscription ? `${user.subscription.plan} / ${user.subscription.status}` : "None"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Joined</p>
                  <p className="mt-2 font-medium">{user.created_at ? formatDate(user.created_at) : "—"}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 rounded-full"
                onClick={() => openManage(user.id)}
              >
                <Pencil className="size-3.5" />
                Manage user
              </Button>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card className="border-border/70 bg-card/85">
            <CardContent className="px-4 py-14 text-center text-sm text-muted-foreground">
              No matching users found.
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="hidden overflow-hidden border-border/70 bg-card/80 shadow-sm md:block">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                {["User", "Role", "Subscription", "Joined", "Action"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/25">
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <p className="font-medium">{user.full_name || "Unnamed user"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {user.subscription ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium capitalize">
                          {user.subscription.plan} / {user.subscription.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.subscription.current_period_end
                            ? `Until ${formatDate(user.subscription.current_period_end)}`
                            : "No period end set"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No subscription</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">
                    {user.created_at ? formatDate(user.created_at) : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openManage(user.id)}
                    >
                      <Pencil className="size-3.5" />
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-sm text-muted-foreground">
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto p-0">
          <DialogHeader className="border-b border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),transparent)] px-6 py-5">
            <DialogTitle className="font-display text-3xl">Manage User</DialogTitle>
          </DialogHeader>

          {detailLoading || !managed ? (
            <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading user data
            </div>
          ) : (
            <div className="space-y-6 p-6">
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
                <Card className="border-border/70 bg-card/85">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Identity
                        </p>
                        <h2 className="mt-2 text-xl font-semibold">
                          {managed.user.full_name}
                        </h2>
                        <p className="text-sm text-muted-foreground">{managed.user.email}</p>
                      </div>
                      <Badge variant={managed.user.role === "admin" ? "default" : "secondary"}>
                        {managed.user.role}
                      </Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Full name</Label>
                        <Input
                          value={profileForm.full_name}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              full_name: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Role</Label>
                        <Select
                          value={profileForm.role}
                          onValueChange={(value) =>
                            setProfileForm((prev) => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="subscriber">Subscriber</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          value={profileForm.phone}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              phone: event.target.value,
                            }))
                          }
                          placeholder="+91..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Country</Label>
                        <Input
                          maxLength={2}
                          value={profileForm.country}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              country: event.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="IN"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <p className="text-xs text-muted-foreground">
                        Joined {managed.user.created_at ? formatDate(managed.user.created_at) : "—"}
                      </p>
                      <Button onClick={handleProfileSave} disabled={savingProfile} className="gap-2 rounded-full">
                        {savingProfile && <Loader2 className="size-4 animate-spin" />}
                        <UserCog className="size-4" />
                        Save Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-muted/20">
                  <CardContent className="space-y-4 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Access Snapshot
                    </p>
                    <div className="grid gap-3">
                      <div className="rounded-xl border bg-background p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ShieldCheck className="size-4 text-primary" />
                          Current role
                        </div>
                        <p className="mt-2 text-lg font-semibold capitalize">{managed.user.role}</p>
                      </div>
                      <div className="rounded-xl border bg-background p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Wallet className="size-4 text-primary" />
                          Current plan
                        </div>
                        <p className="mt-2 text-lg font-semibold capitalize">
                          {managed.subscription?.plan ?? "None"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground capitalize">
                          {managed.subscription?.status ?? "No subscription record"}
                        </p>
                      </div>
                      <div className="rounded-xl border bg-background p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Target className="size-4 text-primary" />
                          Active scores
                        </div>
                        <p className="mt-2 text-lg font-semibold">{managed.scores.length}/5</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Draw eligibility requires all five retained scores.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/70 bg-card/85">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Subscription
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Adjust lifecycle state and charity allocation for the latest subscription record.
                      </p>
                    </div>
                    {managed.subscription?.amount_pence ? (
                      <Badge variant="outline" className="rounded-full">
                        {formatCurrency(
                          managed.subscription.amount_pence,
                          managed.subscription.currency ?? "INR",
                        )}
                      </Badge>
                    ) : null}
                  </div>

                  {managed.subscription ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Plan</Label>
                        <Select
                          value={subscriptionForm.plan}
                          onValueChange={(value) =>
                            setSubscriptionForm((prev) => ({
                              ...prev,
                              plan: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">
                              Monthly ({formatCurrency(PLANS.monthly.amountPence)})
                            </SelectItem>
                            <SelectItem value="yearly">
                              Yearly ({formatCurrency(PLANS.yearly.amountPence)})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select
                          value={subscriptionForm.status}
                          onValueChange={(value) =>
                            setSubscriptionForm((prev) => ({
                              ...prev,
                              status: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="lapsed">Lapsed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Charity contribution %</Label>
                        <Input
                          type="number"
                          min={10}
                          max={100}
                          value={subscriptionForm.charity_percentage}
                          onChange={(event) =>
                            setSubscriptionForm((prev) => ({
                              ...prev,
                              charity_percentage: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Current period end</Label>
                        <Input
                          type="date"
                          value={subscriptionForm.current_period_end}
                          onChange={(event) =>
                            setSubscriptionForm((prev) => ({
                              ...prev,
                              current_period_end: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-1.5 lg:col-span-2">
                        <Label>Selected charity</Label>
                        <Select
                          value={subscriptionForm.selected_charity_id || "none"}
                          onValueChange={(value) =>
                            setSubscriptionForm((prev) => ({
                              ...prev,
                              selected_charity_id: value === "none" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No charity linked</SelectItem>
                            {charities.map((charity) => (
                              <SelectItem key={charity.id} value={charity.id}>
                                {charity.name}
                                {charity.is_active === false ? " (inactive)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {selectedCharity
                            ? `Currently targeting ${selectedCharity.name}.`
                            : "No charity is linked to this subscription."}
                        </p>
                      </div>

                      <div className="lg:col-span-2 flex items-center justify-between border-t pt-4">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>
                            Dodo ID: {managed.subscription.dodo_subscription_id ?? "—"}
                          </p>
                          <p>
                            Stored amount updates automatically from the selected plan.
                          </p>
                        </div>
                        <Button
                          onClick={handleSubscriptionSave}
                          disabled={savingSubscription}
                          className="gap-2 rounded-full"
                        >
                          {savingSubscription && <Loader2 className="size-4 animate-spin" />}
                          Save Subscription
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                      No subscription record exists for this user yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/85">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Score Control
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add, correct, or remove retained scores without leaving the admin surface.
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-2">
                      {(managed.scores ?? [])
                        .slice()
                        .sort((a, b) => b.score_date.localeCompare(a.score_date))
                        .map((score, index) => (
                          <div
                            key={score.id}
                            className="flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-3"
                          >
                            <Badge variant="outline" className="w-7 justify-center px-0">
                              {index + 1}
                            </Badge>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{score.score} Stableford</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(score.score_date)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setScoreForm({
                                  id: score.id,
                                  score: String(score.score),
                                  score_date: score.score_date,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => setDeletingScoreId(score.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))}

                      {managed.scores.length === 0 && (
                        <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                          No scores retained for this user.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border bg-background p-4">
                      <div className="mb-4">
                        <p className="text-sm font-semibold">
                          {scoreForm.id ? "Edit retained score" : "Add a score"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          New inserts still obey the database rolling-five trigger.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label>Score</Label>
                          <Input
                            type="number"
                            min={1}
                            max={45}
                            value={scoreForm.score}
                            onChange={(event) =>
                              setScoreForm((prev) => ({
                                ...prev,
                                score: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Round date</Label>
                          <Input
                            type="date"
                            value={scoreForm.score_date}
                            onChange={(event) =>
                              setScoreForm((prev) => ({
                                ...prev,
                                score_date: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={handleScoreSubmit}
                            disabled={scoreSubmitting}
                          >
                            {scoreSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {scoreForm.id ? "Update Score" : "Save Score"}
                          </Button>
                          {scoreForm.id && (
                            <Button
                              variant="outline"
                              onClick={resetScoreForm}
                              disabled={scoreSubmitting}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingScoreId}
        onOpenChange={(open) => !open && setDeletingScoreId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this score?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the retained score from the user record immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep score</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteScore}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete score
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
