// ─── Typography Checker (deterministic) ─────────────────────────────
// Checks font usage against approved typography tokens.

import type { ValidateRequest, Violation } from "@kyra/brand-core";

export async function checkTypography(req: ValidateRequest): Promise<Violation[]> {
  // TODO: Parse design files or HTML for font-family usage,
  // compare against approved typography tokens.
  // For text-only artifacts, this is a no-op.
  return [];
}
