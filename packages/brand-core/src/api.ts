// ─── API Types ──────────────────────────────────────────────────────
// Request/response shapes for the three core endpoints.

import { z } from "zod";

// ─── /validate ──────────────────────────────────────────────────────

export const Severity = z.enum(["error", "warning", "info"]);
export type Severity = z.infer<typeof Severity>;

export const Violation = z.object({
  id: z.string(),
  ruleRef: z.string(), // which rule triggered this
  severity: Severity,
  category: z.enum([
    "color",
    "typography",
    "spacing",
    "logo",
    "voice",
    "vocabulary",
    "reading-level",
    "composition",
    "disclaimer",
    "policy",
    "custom",
  ]),
  message: z.string(),
  location: z.object({
    type: z.enum(["text-range", "bounding-box", "element", "global"]),
    start: z.number().optional(),
    end: z.number().optional(),
    selector: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  confidence: z.number().min(0).max(1),
  explanation: z.string().optional(), // for LLM-judgment checks
  suggestion: z.string().optional(), // what to change
  autoFixable: z.boolean(),
});

export type Violation = z.infer<typeof Violation>;

export const ValidateRequest = z.object({
  brandId: z.string().uuid(),
  artifact: z.object({
    type: z.enum(["text", "image", "url", "design-file", "html", "raw"]),
    content: z.string(), // base64 for images, text for text, URL for urls
    mimeType: z.string().optional(),
    channel: z.string().optional(), // context for channel-specific rules
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  checks: z.array(z.string()).optional(), // specific checks to run, or all
});

export type ValidateRequest = z.infer<typeof ValidateRequest>;

export const ValidateResponse = z.object({
  brandId: z.string().uuid(),
  score: z.number().min(0).max(100), // overall brand compliance score
  violations: z.array(Violation),
  checksRun: z.array(z.string()),
  timestamp: z.string().datetime(),
  auditId: z.string().uuid(),
});

export type ValidateResponse = z.infer<typeof ValidateResponse>;

// ─── /transform ─────────────────────────────────────────────────────

export const TransformRequest = z.object({
  brandId: z.string().uuid(),
  artifact: z.object({
    type: z.enum(["text", "image", "url", "design-file", "html", "raw"]),
    content: z.string(),
    mimeType: z.string().optional(),
  }),
  operations: z.array(z.object({
    type: z.enum([
      "recolor",
      "rewrite-voice",
      "simplify-reading-level",
      "fix-spacing",
      "fix-typography",
      "resize",
      "add-disclaimer",
      "auto-fix-violations",
    ]),
    params: z.record(z.string(), z.unknown()).optional(),
    violationId: z.string().optional(), // fix a specific violation
  })),
});

export type TransformRequest = z.infer<typeof TransformRequest>;

export const TransformResponse = z.object({
  brandId: z.string().uuid(),
  result: z.object({
    type: z.string(),
    content: z.string(),
    mimeType: z.string().optional(),
  }),
  operationsApplied: z.array(z.object({
    type: z.string(),
    status: z.enum(["applied", "skipped", "failed"]),
    detail: z.string().optional(),
  })),
  timestamp: z.string().datetime(),
  auditId: z.string().uuid(),
});

export type TransformResponse = z.infer<typeof TransformResponse>;

// ─── /ground ────────────────────────────────────────────────────────

export const GroundRequest = z.object({
  brandId: z.string().uuid(),
  context: z.object({
    type: z.string(), // e.g. "press-release", "social-post", "email"
    prompt: z.string().optional(),
    channel: z.string().optional(),
    audience: z.string().optional(),
  }),
  include: z.array(z.enum([
    "tokens",
    "voice",
    "vocabulary",
    "exemplars",
    "disclaimers",
    "patterns",
    "all",
  ])).optional(),
});

export type GroundRequest = z.infer<typeof GroundRequest>;

export const GroundResponse = z.object({
  brandId: z.string().uuid(),
  grounding: z.object({
    systemPrompt: z.string(), // ready-to-inject prompt augmentation
    tokens: z.record(z.string(), z.unknown()).optional(),
    voiceRules: z.object({
      tone: z.array(z.object({ dimension: z.string(), value: z.number() })),
      bannedWords: z.array(z.string()),
      guidelines: z.array(z.string()),
    }).optional(),
    exemplars: z.array(z.object({
      content: z.string(),
      annotation: z.string(),
    })).optional(),
    disclaimers: z.array(z.string()).optional(),
  }),
  timestamp: z.string().datetime(),
  auditId: z.string().uuid(),
});

export type GroundResponse = z.infer<typeof GroundResponse>;
