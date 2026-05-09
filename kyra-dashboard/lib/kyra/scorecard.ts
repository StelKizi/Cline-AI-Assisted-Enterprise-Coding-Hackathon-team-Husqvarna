import type { ComponentSpec, ComponentsJson, ScorecardResult } from "./types";

const RAW_TAGS: Record<string, string> = {
  button: "<button",
  input: "<input",
  card: "<div",
  link: "<a ",
  heading: "<h1",
  text: "<p",
  select: "<select",
  checkbox: 'type="checkbox"',
};

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items)];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** First JSX opening tag for `<Name ...>` or `<Name/>` (handles quotes). */
export function extractFirstOpeningTag(code: string, componentName: string): string | null {
  const needle = `<${componentName}`;
  const idx = code.indexOf(needle);
  if (idx === -1) return null;
  const boundary = idx + needle.length;
  const next = code[boundary];
  if (
    next !== undefined &&
    next !== " " &&
    next !== "\n" &&
    next !== "\r" &&
    next !== "\t" &&
    next !== ">" &&
    next !== "/"
  ) {
    return null;
  }
  let i = boundary;
  let inQuote: '"' | "'" | null = null;
  const start = idx;
  while (i < code.length) {
    const c = code[i]!;
    if (inQuote) {
      if (c === "\\" && i + 1 < code.length) {
        i += 2;
        continue;
      }
      if (c === inQuote) inQuote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inQuote = c;
      i++;
      continue;
    }
    if (c === "/" && code[i + 1] === ">") {
      return code.slice(start, i + 2);
    }
    if (c === ">") {
      return code.slice(start, i + 1);
    }
    i++;
  }
  return null;
}

export function extractVariantFromOpenTag(openTag: string): string | null {
  const m = openTag.match(/\bvariant=["']([^"']+)["']/);
  return m?.[1] ?? null;
}

/** Kyra component types present in JSX, in first-appearance order (longest names first for regex). */
export function discoverKyraComponents(code: string, registry: ComponentsJson): string[] {
  const names = Object.keys(registry).sort((a, b) => b.length - a.length);
  if (!names.length) return [];
  const pattern = new RegExp(`<(${names.map(escapeRegExp).join("|")})\\b`, "g");
  const out: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const n = m[1];
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

export function runComplianceScorecard(
  componentName: string,
  code: string,
  spec: ComponentSpec,
): ScorecardResult {
  const checks: string[] = [];
  let passed = 0;
  let total = 0;

  const openTag = extractFirstOpeningTag(code, componentName);
  const variantValue = openTag ? extractVariantFromOpenTag(openTag) : null;

  total += 1;
  if (!variantValue) {
    checks.push(
      `✗ Variant check — variant prop missing on <${componentName}>. Required. Allowed: ${JSON.stringify(spec.allowed_variants)}`,
    );
  } else if (!spec.allowed_variants.includes(variantValue)) {
    checks.push(
      `✗ Variant check — "${variantValue}" not in ${JSON.stringify(spec.allowed_variants)}`,
    );
  } else {
    checks.push(`✓ Variant check — "${variantValue}" is valid for <${componentName}>`);
    passed += 1;
  }

  total += 1;
  const violations: string[] = [];
  for (const pattern of spec.forbidden_patterns) {
    if (code.includes(pattern)) violations.push(`"${pattern}"`);
  }
  if (violations.length) {
    checks.push(
      `✗ Token check (${componentName}) — forbidden patterns in snippet: ${violations.join(", ")}. Use design tokens instead.`,
    );
  } else {
    checks.push(`✓ Token check (${componentName}) — no forbidden patterns in snippet`);
    passed += 1;
  }

  total += 1;
  const hexColors = code.match(/#[0-9A-Fa-f]{3,6}/g) ?? [];
  if (hexColors.length) {
    checks.push(
      `✗ Color token check — hardcoded colors found: ${JSON.stringify(hexColors)}. Use color tokens.`,
    );
  } else {
    checks.push("✓ Color token check — no hardcoded hex colors");
    passed += 1;
  }

  total += 1;
  const lowerCode = code.toLowerCase();
  const rawTag = RAW_TAGS[componentName.toLowerCase()];
  const hasComponentTag = code.includes(`<${componentName}`);
  if (rawTag && lowerCode.includes(rawTag) && !hasComponentTag) {
    checks.push(
      `✗ Structure check — raw HTML "${rawTag}" used instead of <${componentName}> component`,
    );
  } else {
    checks.push(`✓ Structure check — <${componentName}> component used correctly`);
    passed += 1;
  }

  const status: ScorecardResult["status"] = passed === total ? "PASS" : "FAIL";
  const fixes: string[] = [];
  if (status === "FAIL") {
    const failing = checks.filter((c) => c.startsWith("✗"));
    for (const f of failing) {
      if (f.includes("Variant")) {
        fixes.push(`On <${componentName}>: use variant="${spec.allowed_variants[0]}"`);
      }
      if (f.includes("Token check") || f.includes("Color token")) {
        const hint = spec.allowed_color_tokens.slice(0, 2);
        fixes.push(`Replace inline styles/colors with design tokens: ${JSON.stringify(hint)}`);
      }
      if (f.includes("Structure")) {
        fixes.push(`Use <${componentName}> component, not raw HTML`);
      }
    }
  }

  return {
    status,
    passed,
    total,
    checks,
    fixes: uniqueStrings(fixes),
  };
}

export type ComplianceBundleItem = {
  component: string;
  result: ScorecardResult;
};

export type ComplianceBundleResult = {
  components: string[];
  items: ComplianceBundleItem[];
  overall: "PASS" | "FAIL";
  totalPassed: number;
  totalChecks: number;
};

/** Run scorecard once per Kyra component type present in `code` (shared snippet — hex/token/structure apply to full JSX). */
export function runComplianceBundle(code: string, registry: ComponentsJson): ComplianceBundleResult {
  const components = discoverKyraComponents(code, registry);
  const items: ComplianceBundleItem[] = [];
  let totalPassed = 0;
  let totalChecks = 0;

  for (const name of components) {
    const spec = registry[name];
    if (!spec) continue;
    const result = runComplianceScorecard(name, code, spec);
    items.push({ component: name, result });
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  const overall: ComplianceBundleResult["overall"] =
    items.length > 0 && items.every((i) => i.result.status === "PASS") ? "PASS" : "FAIL";

  return {
    components,
    items,
    overall,
    totalPassed,
    totalChecks,
  };
}
