import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────
export const signUpSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email:     z.string().email("Invalid email"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, "Password is required"),
});

// ─── Score ────────────────────────────────────────────────────
export const scoreSchema = z.object({
  score:      z.coerce.number().int().min(1).max(45, "Score must be between 1 – 45"),
  score_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

export const scoreUpdateSchema = scoreSchema.extend({
  id: z.string().uuid(),
});

// ─── Charity ──────────────────────────────────────────────────
export const charitySchema = z.object({
  name:        z.string().min(2),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().optional(),
  logo_url:    z.string().url().optional().or(z.literal("")),
  cover_url:   z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  is_featured: z.boolean().default(false),
  is_active:   z.boolean().default(true),
});

// ─── Subscription ─────────────────────────────────────────────
export const subscriptionCreateSchema = z.object({
  plan:               z.enum(["monthly", "yearly"]),
  charity_id:         z.string().uuid(),
  charity_percentage: z.coerce.number().int().min(10).max(100),
});

export const charityUpdateSchema = z.object({
  charity_id:         z.string().uuid(),
  charity_percentage: z.coerce.number().int().min(10).max(100),
});

// ─── Draw ─────────────────────────────────────────────────────
export const drawCreateSchema = z.object({
  draw_month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  logic:      z.enum(["random", "algorithmic"]).default("random"),
});

export const drawPublishSchema = z.object({
  draw_id:         z.string().uuid(),
  winning_numbers: z.array(z.coerce.number().int().min(1).max(45)).length(5),
});

// ─── Winner ───────────────────────────────────────────────────
export const proofUploadSchema = z.object({
  winner_id: z.string().uuid(),
  proof_url: z.string().url(),
});

export const winnerReviewSchema = z.object({
  winner_id:      z.string().uuid(),
  payment_status: z.enum(["paid", "rejected"]),
  admin_notes:    z.string().optional(),
});

// ─── Types ────────────────────────────────────────────────────
export type SignUpInput              = z.infer<typeof signUpSchema>;
export type LoginInput               = z.infer<typeof loginSchema>;
export type ScoreInput               = z.infer<typeof scoreSchema>;
export type ScoreUpdateInput         = z.infer<typeof scoreUpdateSchema>;
export type CharityInput             = z.infer<typeof charitySchema>;
export type SubscriptionCreateInput  = z.infer<typeof subscriptionCreateSchema>;
export type DrawCreateInput          = z.infer<typeof drawCreateSchema>;
export type DrawPublishInput         = z.infer<typeof drawPublishSchema>;
export type WinnerReviewInput        = z.infer<typeof winnerReviewSchema>;
