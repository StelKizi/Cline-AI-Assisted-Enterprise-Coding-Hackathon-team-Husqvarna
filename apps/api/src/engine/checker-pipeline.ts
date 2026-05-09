// ─── Checker Pipeline ───────────────────────────────────────────────
// Three classes: deterministic, RAG-grounded, vision-judgment.
// All return Violations. Pipeline runs them all and merges results.

import type { ValidateRequest, Violation } from "@kyra/brand-core";
import { checkColors } from "./checkers/color.js";
import { checkVocabulary } from "./checkers/vocabulary.js";
import { checkTypography } from "./checkers/typography.js";
import { checkReadingLevel } from "./checkers/reading-level.js";
import { checkComposition } from "./checkers/composition.js";

export type Checker = (req: ValidateRequest) => Promise<Violation[]>;

const allCheckers: Record<string, Checker> = {
  color: checkColors,
  vocabulary: checkVocabulary,
  typography: checkTypography,
  "reading-level": checkReadingLevel,
  composition: checkComposition,
};

export async function runCheckers(req: ValidateRequest): Promise<Violation[]> {
  const checksToRun = req.checks || Object.keys(allCheckers);

  const results = await Promise.all(
    checksToRun
      .filter((check) => allCheckers[check])
      .map((check) => allCheckers[check](req))
  );

  return results.flat();
}
