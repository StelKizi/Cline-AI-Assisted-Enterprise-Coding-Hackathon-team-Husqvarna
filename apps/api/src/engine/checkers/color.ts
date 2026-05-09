// ─── Color Checker (deterministic) ──────────────────────────────────
// Checks hex colors in text/HTML against the approved palette.

import type { ValidateRequest, Violation } from "@kyra/brand-core";
import { v4 as uuid } from "uuid";

const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;

export async function checkColors(req: ValidateRequest): Promise<Violation[]> {
  const violations: Violation[] = [];

  if (req.artifact.type !== "text" && req.artifact.type !== "html") {
    return violations;
  }

  // TODO: Fetch approved palette from brand state
  const approvedColors = new Set<string>(); // will be populated from tokens

  const matches = req.artifact.content.matchAll(HEX_REGEX);
  for (const match of matches) {
    const color = match[0].toLowerCase();
    if (approvedColors.size > 0 && !approvedColors.has(color)) {
      const nearest = findNearestApproved(color, approvedColors);
      violations.push({
        id: uuid(),
        ruleRef: "token/color-palette",
        severity: "error",
        category: "color",
        message: `Color ${color} is off-palette${nearest ? `. Closest approved: ${nearest}` : ""}`,
        location: {
          type: "text-range",
          start: match.index,
          end: match.index! + match[0].length,
        },
        confidence: 1.0, // deterministic = high confidence
        suggestion: nearest || undefined,
        autoFixable: true,
      });
    }
  }

  return violations;
}

function findNearestApproved(color: string, approved: Set<string>): string | null {
  if (approved.size === 0) return null;

  let nearest = "";
  let minDist = Infinity;

  for (const a of approved) {
    const dist = colorDistance(color, a);
    if (dist < minDist) {
      minDist = dist;
      nearest = a;
    }
  }

  return nearest;
}

function colorDistance(a: string, b: string): number {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);

  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}
