// ─── Voice Rules ────────────────────────────────────────────────────
// Vocabulary, tone, channel-specific voice parameters.

import { z } from "zod";

export const ToneParameter = z.object({
  dimension: z.string(), // e.g. "formality", "enthusiasm", "directness"
  value: z.number().min(0).max(1), // 0 = low, 1 = high
  description: z.string().optional(),
});

export type ToneParameter = z.infer<typeof ToneParameter>;

export const ChannelVoice = z.object({
  channel: z.string(), // e.g. "linkedin", "twitter", "press-release", "internal"
  toneParameters: z.array(ToneParameter),
  maxReadingGrade: z.number().min(1).max(18).optional(),
  targetReadingGrade: z.number().min(1).max(18).optional(),
  maxLength: z.number().optional(), // chars
  additionalGuidelines: z.array(z.string()).optional(),
});

export type ChannelVoice = z.infer<typeof ChannelVoice>;

export const VoiceRules = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),

  // Vocabulary
  approvedVocabulary: z.array(
    z.object({
      term: z.string(),
      context: z.string().optional(), // when to use
      preferred: z.boolean().default(true),
    })
  ),
  bannedVocabulary: z.array(
    z.object({
      term: z.string(),
      reason: z.string().optional(),
      alternatives: z.array(z.string()).optional(),
    })
  ),

  // Tone
  defaultTone: z.array(ToneParameter),
  channelOverrides: z.array(ChannelVoice),

  // Disclaimers
  requiredDisclaimers: z.array(
    z.object({
      context: z.string(), // e.g. "financial", "medical", "press-release"
      text: z.string(),
      placement: z.enum(["header", "footer", "inline"]),
    })
  ),

  publishedAt: z.string().datetime(),
  publishedBy: z.string(),
});

export type VoiceRules = z.infer<typeof VoiceRules>;
