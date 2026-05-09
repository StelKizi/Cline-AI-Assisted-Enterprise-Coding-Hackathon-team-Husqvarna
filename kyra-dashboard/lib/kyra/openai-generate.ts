import { buildAuditContextPayload } from "./audit-context";
import type { ComponentSpec, TokensJson } from "./types";

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

export async function generateWithOpenAI(params: {
  prompt: string;
  /** Full user intent for audit context (defaults to the main prompt). */
  auditIntent?: string;
  componentName: string;
  wantsPage: boolean;
  spec: ComponentSpec;
  tokens: TokensJson;
  /** When set, model should revise this JSX using the prompt as the edit instruction. */
  previousJsx?: string;
}): Promise<{ jsx: string } | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const audit = buildAuditContextPayload(
    params.componentName,
    params.auditIntent ?? params.prompt,
    params.spec,
  );

  const revisionBlock = params.previousJsx?.trim()
    ? `
Revision mode: the user payload includes "previousJsx" (current page/snippet). Apply "prompt" as an edit instruction—keep parts that still fit unless the instruction asks to remove or replace them. Return the full updated JSX string (not a diff).
`
    : "";

  const system = `You generate JSX snippets for a design-system demo. Output ONLY valid JSON with a single key "jsx" (string).

Hard rules:
- Use the component tag <${params.componentName}> exactly (PascalCase). Do not substitute raw HTML for that component (e.g. no <button> for Button, no plain <input> for Input, no plain <input type="checkbox"> for Checkbox, no <div> for Card, no <a> for Link, no bare <h1>/<p> for Heading/Text, no <select> for Select).
- Variants and sizes MUST be chosen only from audit.constraints.allowed_variants and audit.constraints.allowed_sizes.
- Include all audit.constraints.required_props (variant is required).
- Never use forbidden patterns from audit.constraints.forbidden_patterns (e.g. no style= / inline style objects / hardcoded hex colors).
- No <style> blocks. No className unless it is a plain string without hex/rgb hacks.
- If wantsPage is true: wrap output in <main> and include exactly one <h1> with a short title derived from the user prompt (plain text).
${revisionBlock}
You will be given audit JSON and tokens JSON for reference.`;

  const user = JSON.stringify(
    {
      wantsPage: params.wantsPage,
      prompt: params.prompt,
      ...(params.previousJsx?.trim() ? { previousJsx: params.previousJsx } : {}),
      audit,
      tokens: params.tokens,
    },
    null,
    2,
  );

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${text.slice(0, 600)}`);
  }

  const data = (await res.json()) as OpenAIChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  const parsed = JSON.parse(content) as { jsx?: unknown };
  if (typeof parsed.jsx !== "string" || !parsed.jsx.trim()) {
    throw new Error('OpenAI JSON must contain non-empty string "jsx"');
  }

  return { jsx: parsed.jsx.trim() };
}
