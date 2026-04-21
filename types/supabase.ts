// Auto-generated types. Regenerate with:
// npx supabase gen types typescript --project-id <your-id> > types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:          string;
          full_name:   string;
          email:       string;
          role:        "subscriber" | "admin";
          avatar_url:  string | null;
          phone:       string | null;
          country:     string | null;
          created_at:  string;
          updated_at:  string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id:                   string;
          user_id:              string;
          plan:                 "monthly" | "yearly";
          status:               "active" | "inactive" | "cancelled" | "lapsed";
          dodo_subscription_id: string | null;
          dodo_customer_id:     string | null;
          amount_pence:         number;
          currency:             string;
          charity_percentage:   number;
          selected_charity_id:  string | null;
          current_period_start: string | null;
          current_period_end:   string | null;
          cancelled_at:         string | null;
          created_at:           string;
          updated_at:           string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
      charities: {
        Row: {
          id:          string;
          name:        string;
          slug:        string;
          description: string | null;
          logo_url:    string | null;
          cover_url:   string | null;
          website_url: string | null;
          is_featured: boolean;
          is_active:   boolean;
          events:      Json;
          created_at:  string;
          updated_at:  string;
        };
        Insert: Omit<Database["public"]["Tables"]["charities"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["charities"]["Insert"]>;
      };
      golf_scores: {
        Row: {
          id:         string;
          user_id:    string;
          score:      number;
          score_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["golf_scores"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["golf_scores"]["Insert"]>;
      };
      draws: {
        Row: {
          id:              string;
          draw_month:      string;
          status:          "pending" | "simulation" | "published";
          logic:           "random" | "algorithmic";
          winning_numbers: number[];
          jackpot_amount:  number;
          pool_4match:     number;
          pool_3match:     number;
          jackpot_rolled:  boolean;
          published_at:    string | null;
          created_at:      string;
          updated_at:      string;
        };
        Insert: Omit<Database["public"]["Tables"]["draws"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["draws"]["Insert"]>;
      };
      draw_entries: {
        Row: {
          id:          string;
          draw_id:     string;
          user_id:     string;
          numbers:     number[];
          match_count: number | null;
          prize_tier:  string | null;
          created_at:  string;
        };
        Insert: Omit<Database["public"]["Tables"]["draw_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["draw_entries"]["Insert"]>;
      };
      winners: {
        Row: {
          id:                 string;
          draw_id:            string;
          user_id:            string;
          draw_entry_id:      string;
          prize_tier:         string;
          prize_amount:       number;
          payment_status:     "pending" | "paid" | "rejected";
          proof_url:          string | null;
          proof_reviewed_at:  string | null;
          admin_notes:        string | null;
          paid_at:            string | null;
          created_at:         string;
          updated_at:         string;
        };
        Insert: Omit<Database["public"]["Tables"]["winners"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["winners"]["Insert"]>;
      };
      charity_contributions: {
        Row: {
          id:              string;
          user_id:         string;
          charity_id:      string;
          subscription_id: string;
          amount:          number;
          currency:        string;
          period_start:    string;
          period_end:      string;
          created_at:      string;
        };
        Insert: Omit<Database["public"]["Tables"]["charity_contributions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["charity_contributions"]["Insert"]>;
      };
      payment_events: {
        Row: {
          id:         string;
          user_id:    string | null;
          event_type: string;
          provider:   string;
          payload:    Json;
          processed:  boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payment_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["payment_events"]["Insert"]>;
      };
    };
    Views:    {};
    Functions: {};
    Enums: {
      subscription_plan:   "monthly" | "yearly";
      subscription_status: "active" | "inactive" | "cancelled" | "lapsed";
      draw_status:         "pending" | "simulation" | "published";
      draw_logic:          "random" | "algorithmic";
      payment_status:      "pending" | "paid" | "rejected";
      user_role:           "subscriber" | "admin";
    };
  };
};
