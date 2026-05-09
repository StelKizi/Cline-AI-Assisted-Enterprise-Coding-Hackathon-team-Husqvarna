// ─── Reading Level Checker (deterministic) ──────────────────────────
// Flesch-Kincaid grade level check against brand target.

import type { ValidateRequest, Violation } from "@kyra/brand-core";
import { v4 as uuid } from "uuid";

export async function checkReadingLevel(req: ValidateRequest): Promise<Violation[]> {
  if (req.artifact.type !== "text" && req.artifact.type !== "html") {
    return [];
  }

  const text = req.artifact.content;
  const grade = fleschKincaidGrade(text);

  // TODO: Fetch target from brand voice rules
  const targetGrade = 8;

  if (grade > targetGrade + 2) {
    return [
      {
        id: uuid(),
        ruleRef: "voice/reading-level",
        severity: "warning",
        category: "reading-level",
        message: `Reading level is grade ${grade.toFixed(1)}, brand target is grade ${targetGrade}`,
        location: { type: "global" },
        confidence: 0.85,
        suggestion: `Simplify language to reach grade ${targetGrade} reading level`,
        autoFixable: true,
      },
    ];
  }

  return [];
}

function fleschKincaidGrade(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  return (
    0.39 * (words.length / sentences.length) +
    11.8 * (syllables / words.length) -
    15.59
  );
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}
