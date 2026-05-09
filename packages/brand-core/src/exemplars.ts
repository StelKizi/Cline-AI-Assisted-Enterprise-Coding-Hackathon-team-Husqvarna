// ─── Exemplars & Rejections ─────────────────────────────────────────
// Positive and negative training signal from real artifacts.

import { z } from "zod";

export const Exemplar = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  type: z.enum(["approved", "rejected"]),

  // What it is
  artifactType: z.string(), // e.g. "linkedin-post", "email-campaign", "ad-banner"
  channel: z.string(),
  title: z.string(),
  description: z.string().optional(),

  // The artifact
  url: z.string().url().optional(),
  content: z.string().optional(), // text content if applicable
  thumbnailUrl: z.string().url().optional(),

  // Why it worked / didn't work
  annotations: z.array(z.object({
    aspect: z.string(), // e.g. "color-usage", "tone", "layout"
    note: z.string(),
    sentiment: z.enum(["positive", "negative", "neutral"]),
  })),

  // For rejections: what rules were violated
  violationTags: z.array(z.string()).optional(),

  // Metadata
  tags: z.array(z.string()),
  approvedBy: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type Exemplar = z.infer<typeof Exemplar>;
