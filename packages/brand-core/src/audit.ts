// ─── Audit Log ──────────────────────────────────────────────────────
// Every check, fix, approval — timestamped with actors.

import { z } from "zod";

export const AuditAction = z.enum([
  "validate",
  "transform",
  "ground",
  "approve",
  "reject",
  "override",
  "publish",
  "update-tokens",
  "update-voice",
  "update-policy",
  "add-asset",
  "remove-asset",
  "add-exemplar",
]);

export type AuditAction = z.infer<typeof AuditAction>;

export const AuditEntry = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  action: AuditAction,
  actor: z.object({
    id: z.string(),
    type: z.enum(["user", "plugin", "api-key", "system"]),
    name: z.string(),
  }),
  target: z.object({
    type: z.string(), // e.g. "artifact", "token-set", "voice-rules"
    id: z.string().optional(),
    name: z.string().optional(),
  }),
  details: z.record(z.string(), z.unknown()).optional(),
  source: z.object({
    plugin: z.string().optional(), // "figma", "canva", "slack"
    ip: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
  timestamp: z.string().datetime(),
});

export type AuditEntry = z.infer<typeof AuditEntry>;
