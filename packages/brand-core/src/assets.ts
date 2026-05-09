// ─── Asset Library ──────────────────────────────────────────────────
// Logos, photography, illustrations, icons — with metadata.

import { z } from "zod";

export const AssetVariant = z.enum([
  "primary",
  "secondary",
  "monochrome",
  "reversed",
  "icon-only",
  "wordmark-only",
]);

export const AssetType = z.enum([
  "logo",
  "photography",
  "illustration",
  "icon",
  "pattern",
  "video",
  "audio",
]);

export const ClearSpaceRule = z.object({
  unit: z.enum(["px", "x-height", "percentage"]),
  top: z.number(),
  right: z.number(),
  bottom: z.number(),
  left: z.number(),
});

export type ClearSpaceRule = z.infer<typeof ClearSpaceRule>;

export const Asset = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  type: AssetType,
  name: z.string(),
  variant: AssetVariant.optional(),
  locale: z.string().optional(), // BCP 47
  tags: z.array(z.string()),

  // Storage
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  mimeType: z.string(),
  fileSizeBytes: z.number(),
  dimensions: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),

  // Usage rules
  clearSpace: ClearSpaceRule.optional(),
  minimumSize: z
    .object({
      width: z.number(),
      height: z.number(),
      unit: z.enum(["px", "mm", "in"]),
    })
    .optional(),
  approvedBackgrounds: z.array(z.string()).optional(), // hex colors
  prohibitedUses: z.array(z.string()).optional(),

  uploadedAt: z.string().datetime(),
  uploadedBy: z.string(),
});

export type Asset = z.infer<typeof Asset>;
