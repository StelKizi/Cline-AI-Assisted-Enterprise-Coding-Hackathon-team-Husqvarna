export type ComponentExamples = {
  correct: string;
  incorrect: string;
};

export type ComponentSpec = {
  description: string;
  allowed_variants: string[];
  allowed_sizes: string[];
  allowed_color_tokens: string[];
  required_props: string[];
  forbidden_patterns: string[];
  allowed_props: string[];
  examples: ComponentExamples;
};

export type ComponentsJson = Record<string, ComponentSpec>;

export type TokensJson = Record<string, unknown>;

export type ScorecardResult = {
  status: "PASS" | "FAIL";
  passed: number;
  total: number;
  checks: string[];
  fixes: string[];
};
