// ─── Component Patterns ─────────────────────────────────────────────
// Approved layouts, grids, hierarchy rules.

import { z } from "zod";

export const GridSystem = z.object({
  columns: z.number(),
  gutter: z.string(), // token reference or value
  margin: z.string(),
  breakpoints: z.record(z.string(), z.object({
    columns: z.number(),
    gutter: z.string(),
    margin: z.string(),
  })).optional(),
});

export type GridSystem = z.infer<typeof GridSystem>;

export const HierarchyRule = z.object({
  element: z.string(), // e.g. "headline", "subhead", "body", "caption"
  typographyToken: z.string(), // reference to token path
  colorToken: z.string().optional(),
  maxInstances: z.number().optional(), // e.g. "only 1 headline per card"
});

export type HierarchyRule = z.infer<typeof HierarchyRule>;

export const ComponentPattern = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  name: z.string(), // e.g. "social-card", "email-header", "hero-banner"
  description: z.string(),
  category: z.string(),
  grid: GridSystem.optional(),
  hierarchy: z.array(HierarchyRule),
  constraints: z.array(z.object({
    rule: z.string(),
    severity: z.enum(["error", "warning", "info"]),
  })),
  exampleUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});

export type ComponentPattern = z.infer<typeof ComponentPattern>;
