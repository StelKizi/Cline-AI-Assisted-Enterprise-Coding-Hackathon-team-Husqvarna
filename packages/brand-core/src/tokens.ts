// ─── Design Tokens (W3C Design Tokens Format) ──────────────────────
// https://tr.designtokens.org/format/
// Versioned. Every token set has a semver and a published timestamp.

import { z } from "zod";

// ─── Primitive token values ─────────────────────────────────────────

export const ColorValue = z.object({
  $type: z.literal("color"),
  $value: z.string().regex(/^#[0-9a-fA-F]{6,8}$/), // hex only, no named colors
  $description: z.string().optional(),
});

export const DimensionValue = z.object({
  $type: z.literal("dimension"),
  $value: z.string(), // e.g. "16px", "1.5rem"
  $description: z.string().optional(),
});

export const FontFamilyValue = z.object({
  $type: z.literal("fontFamily"),
  $value: z.union([z.string(), z.array(z.string())]),
  $description: z.string().optional(),
});

export const FontWeightValue = z.object({
  $type: z.literal("fontWeight"),
  $value: z.union([z.number().min(1).max(1000), z.string()]),
  $description: z.string().optional(),
});

export const DurationValue = z.object({
  $type: z.literal("duration"),
  $value: z.string(), // e.g. "200ms"
  $description: z.string().optional(),
});

export const NumberValue = z.object({
  $type: z.literal("number"),
  $value: z.number(),
  $description: z.string().optional(),
});

// ─── Composite token values ─────────────────────────────────────────

export const TypographyValue = z.object({
  $type: z.literal("typography"),
  $value: z.object({
    fontFamily: z.union([z.string(), z.array(z.string())]),
    fontSize: z.string(),
    fontWeight: z.union([z.number(), z.string()]),
    lineHeight: z.union([z.string(), z.number()]),
    letterSpacing: z.string().optional(),
  }),
  $description: z.string().optional(),
});

export const ShadowLayer = z.object({
  offsetX: z.string(),
  offsetY: z.string(),
  blur: z.string(),
  spread: z.string(),
  color: z.string(),
});

export const ShadowValue = z.object({
  $type: z.literal("shadow"),
  $value: z.union([ShadowLayer, z.array(ShadowLayer)]),
  $description: z.string().optional(),
});

// ─── Token value union ──────────────────────────────────────────────

export const TokenValue = z.discriminatedUnion("$type", [
  ColorValue,
  DimensionValue,
  FontFamilyValue,
  FontWeightValue,
  DurationValue,
  NumberValue,
  TypographyValue,
  ShadowValue,
]);

export type TokenValue = z.infer<typeof TokenValue>;

// ─── Token groups (nested, matching W3C format) ─────────────────────

export const TokenGroup = z.object({
  $description: z.string().optional(),
  tokens: z.record(z.string(), TokenValue),
});

export type TokenGroup = z.infer<typeof TokenGroup>;

// ─── Token set: versioned collection ────────────────────────────────

export const TokenSet = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  name: z.string(), // e.g. "default", "dark-mode", "compact"
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // semver
  groups: z.record(z.string(), TokenGroup), // e.g. { color: {...}, spacing: {...} }
  publishedAt: z.string().datetime(),
  publishedBy: z.string(),
});

export type TokenSet = z.infer<typeof TokenSet>;
