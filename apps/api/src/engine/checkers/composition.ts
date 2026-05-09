// ─── Composition Checker (LLM vision-judgment) ─────────────────────
// Uses vision model to assess visual composition against brand patterns.
// Returns calibrated confidence with explanation.

import type { ValidateRequest, Violation } from "@kyra/brand-core";

export async function checkComposition(req: ValidateRequest): Promise<Violation[]> {
  if (req.artifact.type !== "image" && req.artifact.type !== "design-file") {
    return [];
  }

  // TODO: Send to vision model (Claude, GPT-4V) with brand patterns as context
  // Return violations with calibrated confidence scores
  // This is the LLM-judgment class — confidence < 1.0, includes explanation

  return [];
}
