export type GeneratedRecord = {
  slug: string;
  prompt: string;
  componentName: string;
  /** User asked for a full page shell (main + heading) vs. single component only */
  wantsPage: boolean;
  /** JSX-ish snippet for Kyra compliance (same rules as MCP scorecard). */
  jsx: string;
  /** Self-contained HTML document for iframe preview; styles derived from tokens.json only. */
  previewHtml: string;
  createdAt: string;
  source: "stub" | "openai";
};
