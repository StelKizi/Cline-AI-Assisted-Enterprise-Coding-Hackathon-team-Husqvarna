import type { ComponentSpec } from "./types";
import { extractFirstOpeningTag, extractVariantFromOpenTag } from "./scorecard";

export function extractSizeFromOpenTag(openTag: string): string | null {
  const m = openTag.match(/\bsize=["']([^"']+)["']/);
  return m?.[1] ?? null;
}

/** @deprecated use resolveVariant with componentName for multi-component snippets */
export function extractVariant(jsx: string): string | null {
  const m = jsx.match(/variant=["']([^"']+)["']/);
  return m?.[1] ?? null;
}

export function extractSize(jsx: string): string | null {
  const m = jsx.match(/size=["']([^"']+)["']/);
  return m?.[1] ?? null;
}

export function resolveVariant(
  jsx: string,
  spec: ComponentSpec,
  componentName?: string,
): string {
  let v: string | null = null;
  if (componentName) {
    const open = extractFirstOpeningTag(jsx, componentName);
    v = open ? extractVariantFromOpenTag(open) : null;
  }
  if (!v) {
    v = extractVariant(jsx);
  }
  if (v && spec.allowed_variants.includes(v)) return v;
  return spec.allowed_variants[0];
}

export function resolveSize(jsx: string, spec: ComponentSpec, componentName?: string): string {
  let s: string | null = null;
  if (componentName) {
    const open = extractFirstOpeningTag(jsx, componentName);
    s = open ? extractSizeFromOpenTag(open) : null;
  }
  if (!s) {
    s = extractSize(jsx);
  }
  if (s && spec.allowed_sizes.includes(s)) return s;
  return spec.allowed_sizes.includes("md") ? "md" : spec.allowed_sizes[0];
}
