import { z } from "zod";

// Base segment schema
const segmentBase = {
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(120),
  description: z.string().optional(),
  min_spend_cents: z.coerce.number().int().min(0).default(0),
  max_spend_cents: z.coerce.number().int().positive().nullable().optional(),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
  priority: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
};

export const createSegmentSchema = z.object({
  ...segmentBase,
});

export const updateSegmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().optional(),
  min_spend_cents: z.coerce.number().int().min(0).optional(),
  max_spend_cents: z.coerce.number().int().positive().nullable().optional(),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
  priority: z.coerce.number().int().optional(),
  is_active: z.boolean().optional(),
});

export const assignSegmentSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  segment_id: z.coerce.number().int().positive().nullable(),
});

export const segmentFilterSchema = z.object({
  segment: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

export type CreateSegmentInput = z.infer<typeof createSegmentSchema>;
export type UpdateSegmentInput = z.infer<typeof updateSegmentSchema>;
export type AssignSegmentInput = z.infer<typeof assignSegmentSchema>;
