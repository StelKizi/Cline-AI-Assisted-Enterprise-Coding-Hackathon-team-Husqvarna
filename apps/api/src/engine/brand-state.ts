// ─── Brand State Engine (Brand Agnostic) ──────────────────────────────────
// Dynamically loads tokens and components for any brand state.

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

export function getBrandDir(brandSlugOrId?: string): string {
  if (process.env.KYRA_BRAND_DIR && existsSync(process.env.KYRA_BRAND_DIR)) {
    return process.env.KYRA_BRAND_DIR;
  }

  const slug = brandSlugOrId || process.env.KYRA_BRAND || "acme";

  const candidates = [
    resolve(ROOT, "brands", slug),
    resolve(ROOT, "brands", slug.toLowerCase()),
    resolve(ROOT, "kyra-mcp/design_system"),
  ];

  for (const dir of candidates) {
    if (existsSync(resolve(dir, "tokens.json"))) {
      return dir;
    }
  }

  return resolve(ROOT, "brands/acme");
}

export function getTokens(brandSlugOrId?: string): Record<string, unknown> {
  const dir = getBrandDir(brandSlugOrId);
  const path = resolve(dir, "tokens.json");
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf-8"));
}

export function getComponents(brandSlugOrId?: string): Record<string, unknown> {
  const dir = getBrandDir(brandSlugOrId);
  const path = resolve(dir, "components.json");
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf-8"));
}

/** Extract all approved hex colors from the token set */
export function getApprovedColors(brandSlugOrId?: string): Set<string> {
  const tokens = getTokens(brandSlugOrId);
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

  if (tokens.color) {
    walk(tokens.color);
  }
  return colors;
}

/** Extract banned vocabulary from components (forbidden patterns) */
export function getBannedTerms(brandSlugOrId?: string): Array<{ term: string; reason?: string; alternatives?: string[] }> {
  const components = getComponents(brandSlugOrId);
  const terms: Array<{ term: string; reason?: string; alternatives?: string[] }> = [];

  function walk(obj: unknown) {
    if (!obj || typeof obj !== "object") return;
    const rec = obj as Record<string, unknown>;

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
