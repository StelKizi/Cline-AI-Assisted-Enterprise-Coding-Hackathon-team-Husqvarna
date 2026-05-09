import type { ComponentSpec } from "./types";

export function buildAuditContextPayload(
  componentName: string,
  intent: string,
  spec: ComponentSpec,
) {
  return {
    component: componentName,
    intent,
    constraints: {
      required_props: spec.required_props,
      allowed_variants: spec.allowed_variants,
      allowed_sizes: spec.allowed_sizes,
      allowed_color_tokens: spec.allowed_color_tokens,
      forbidden_patterns: spec.forbidden_patterns,
      allowed_props: spec.allowed_props,
    },
    correct_example: spec.examples.correct,
    incorrect_example: spec.examples.incorrect,
    instruction: `Use only allowed_variants and allowed_sizes. Reference colors by token name only (e.g. color.brand.primary). Never use hardcoded hex, rgb, or inline styles. Always include required_props: ${JSON.stringify(spec.required_props)}.`,
  };
}
