// ─── /ground ────────────────────────────────────────────────────────
// The strategic endpoint. Other AI tools call this to become brand-aware.

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuid } from "uuid";
import { GroundRequest, type GroundResponse } from "@kyra/brand-core";

export const groundRoute = new Hono();

groundRoute.post("/", zValidator("json", GroundRequest), async (c) => {
  const req = c.req.valid("json");

  // TODO: Fetch brand state from storage
  // TODO: Retrieve relevant exemplars via vector search
  // TODO: Build grounding context based on req.include

  // Build the system prompt augmentation
  const systemPrompt = buildGroundingPrompt(req);

  const response: GroundResponse = {
    brandId: req.brandId,
    grounding: {
      systemPrompt,
      voiceRules: {
        tone: [
          { dimension: "formality", value: 0.7 },
          { dimension: "enthusiasm", value: 0.6 },
        ],
        bannedWords: [], // TODO: fetch from brand state
        guidelines: [],
      },
      exemplars: [],
      disclaimers: [],
    },
    timestamp: new Date().toISOString(),
    auditId: uuid(),
  };

  return c.json(response);
});

function buildGroundingPrompt(req: GroundRequest): string {
  const parts: string[] = [
    `You are generating content for brand: ${req.brandId}.`,
    `Content type: ${req.context.type}.`,
  ];

  if (req.context.channel) {
    parts.push(`Channel: ${req.context.channel}.`);
  }
  if (req.context.audience) {
    parts.push(`Target audience: ${req.context.audience}.`);
  }

  parts.push(
    "Follow the brand voice rules provided. Do not use any banned vocabulary.",
    "Match the tone parameters. Include required disclaimers where applicable."
  );

  return parts.join("\n");
}
