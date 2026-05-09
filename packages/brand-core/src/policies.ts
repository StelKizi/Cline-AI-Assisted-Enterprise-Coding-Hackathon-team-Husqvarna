// ─── Policies ───────────────────────────────────────────────────────
// Channel rules, co-brand rules, regulatory rules.

import { z } from "zod";

export const Policy = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  name: z.string(),
  type: z.enum(["channel", "co-brand", "regulatory", "general"]),
  scope: z.object({
    channels: z.array(z.string()).optional(), // which channels this applies to
    regions: z.array(z.string()).optional(), // ISO country codes
    partners: z.array(z.string()).optional(), // partner brand IDs
  }),
  rules: z.array(z.object({
    id: z.string(),
    description: z.string(),
    severity: z.enum(["error", "warning", "info"]),
    check: z.enum(["deterministic", "llm-judgment", "manual-review"]),
    autoFixable: z.boolean(),
  })),
  effectiveFrom: z.string().datetime(),
  effectiveUntil: z.string().datetime().optional(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
});

export type Policy = z.infer<typeof Policy>;
