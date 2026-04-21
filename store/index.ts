import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────
export interface GolfScore {
  id:         string;
  score:      number;
  score_date: string;
  created_at: string;
}

export interface Subscription {
  id:                  string;
  plan:                "monthly" | "yearly";
  status:              "active" | "inactive" | "cancelled" | "lapsed";
  charity_percentage:  number;
  selected_charity_id: string | null;
  current_period_end:  string | null;
}

export interface Profile {
  id:        string;
  full_name: string;
  email:     string;
  role:      "subscriber" | "admin";
  avatar_url: string | null;
}

interface AppState {
  // Auth
  user:    User | null;
  profile: Profile | null;
  setUser:    (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;

  // Scores (local cache — refreshed from server)
  scores: GolfScore[];
  setScores: (scores: GolfScore[]) => void;
  addScore:  (score: GolfScore) => void;
  updateScore: (id: string, data: Partial<GolfScore>) => void;
  removeScore: (id: string) => void;

  // Subscription
  subscription: Subscription | null;
  setSubscription: (sub: Subscription | null) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      // Auth
      user:    null,
      profile: null,
      setUser:    (user)    => set((s) => { s.user    = user;    }),
      setProfile: (profile) => set((s) => { s.profile = profile; }),

      // Scores
      scores: [],
      setScores:  (scores) => set((s) => { s.scores = scores; }),
      addScore:   (score)  => set((s) => {
        s.scores.unshift(score);
        // Keep only 5
        if (s.scores.length > 5) s.scores = s.scores.slice(0, 5);
      }),
      updateScore: (id, data) => set((s) => {
        const idx = s.scores.findIndex((sc) => sc.id === id);
        if (idx !== -1) Object.assign(s.scores[idx], data);
      }),
      removeScore: (id) => set((s) => {
        s.scores = s.scores.filter((sc) => sc.id !== id);
      }),

      // Subscription
      subscription: null,
      setSubscription: (sub) => set((s) => { s.subscription = sub; }),

      // UI
      sidebarOpen: false,
      setSidebarOpen: (open) => set((s) => { s.sidebarOpen = open; }),
    })),
    {
      name: "golf-give-store",
      partialize: (s) => ({ profile: s.profile, sidebarOpen: s.sidebarOpen }),
    }
  )
);
