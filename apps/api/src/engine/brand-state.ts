// ─── Husqvarna Brand State ───────────────────────────────────────────
// Loads the Husqvarna design system tokens at runtime.
// In production this would be fetched from a DB; for the hackathon
// we read from the checked-in design_system files.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Walk up to repo root
function findRepoRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    try {
      readFileSync(resolve(dir, "turbo.json"));
      return dir;
    } catch {
      dir = resolve(dir, "..");
    }
  }
  return start;
}

const ROOT = findRepoRoot(__dirname);
const TOKENS_PATH = resolve(ROOT, "kyra-mcp/design_system/tokens.json");
const COMPONENTS_PATH = resolve(ROOT, "kyra-mcp/design_system/components.json");

let _tokens: Record<string, unknown> | null = null;
let _components: Record<string, unknown> | null = null;

export function getTokens(): Record<string, unknown> {
  if (!_tokens) {
    _tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf-8"));
  }
  return _tokens!;
}

export function getComponents(): Record<string, unknown> {
  if (!_components) {
    _components = JSON.parse(readFileSync(COMPONENTS_PATH, "utf-8"));
  }
  return _components!;
}

/** Extract all approved hex colors from the token set */
export function getApprovedColors(): Set<string> {
  const tokens = getTokens();
  const colors = new Set<string>();

  function walk(obj: unknown) {
    if (!obj || typeof obj !== "object") return;
    for (const [, v] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v)) {
        colors.add(v.toLowerCase());
      } else if (typeof v === "object") {
        walk(v);
      }
    }
  }

  walk((tokens as Record<string, unknown>).color);
  return colors;
}

/** Extract banned vocabulary from components (forbidden patterns) */
export function getBannedTerms(): Array<{ term: string; reason?: string; alternatives?: string[] }> {
  const components = getComponents();
  const terms: Array<{ term: string; reason?: string; alternatives?: string[] }> = [];

  function walk(obj: unknown) {
    if (!obj || typeof obj !== "object") return;
    const rec = obj as Record<string, unknown>;

    // Look for forbidden_patterns arrays in components
    if (Array.isArray(rec.forbidden_patterns)) {
      for (const p of rec.forbidden_patterns) {
        if (typeof p === "string") {
          terms.push({ term: p, reason: "Forbidden pattern in component spec" });
        } else if (p && typeof p === "object" && "pattern" in p) {
          terms.push({
            term: String((p as Record<string, unknown>).pattern),
            reason: String((p as Record<string, unknown>).reason || "Forbidden pattern"),
          });
        }
      }
    }

    for (const v of Object.values(rec)) {
      if (typeof v === "object") walk(v);
    }
  }

  walk(components);
  return terms;
}
