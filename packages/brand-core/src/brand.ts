// ─── Brand (top-level aggregate) ────────────────────────────────────
// One brand = one customer's complete brand state.

import { z } from "zod";

export const Brand = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),

  // Tier / metering
  plan: z.enum(["starter", "professional", "enterprise"]),
  apiCallsThisMonth: z.number().default(0),
  apiCallsLimit: z.number(),

  // State
  status: z.enum(["active", "suspended", "archived"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Brand = z.infer<typeof Brand>;
