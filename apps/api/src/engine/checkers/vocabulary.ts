// ─── Vocabulary Checker (deterministic) ─────────────────────────────
// Checks text against banned/approved vocabulary lists.

import type { ValidateRequest, Violation } from "@kyra/brand-core";
import { v4 as uuid } from "uuid";

export async function checkVocabulary(req: ValidateRequest): Promise<Violation[]> {
  const violations: Violation[] = [];

  if (req.artifact.type !== "text" && req.artifact.type !== "html") {
    return violations;
  }

  // TODO: Fetch from brand state
  const bannedWords: Array<{ term: string; reason?: string; alternatives?: string[] }> = [];

  const text = req.artifact.content.toLowerCase();

  for (const banned of bannedWords) {
    const regex = new RegExp(`\\b${escapeRegex(banned.term)}\\b`, "gi");
    const matches = text.matchAll(regex);

    for (const match of matches) {
      violations.push({
        id: uuid(),
        ruleRef: "voice/banned-vocabulary",
        severity: "warning",
        category: "vocabulary",
        message: `"${banned.term}" is on the banned list${banned.reason ? `: ${banned.reason}` : ""}`,
        location: {
          type: "text-range",
          start: match.index,
          end: match.index! + match[0].length,
        },
        confidence: 1.0,
        suggestion: banned.alternatives?.join(", ") || undefined,
        autoFixable: banned.alternatives ? banned.alternatives.length > 0 : false,
      });
    }
  }

  return violations;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
