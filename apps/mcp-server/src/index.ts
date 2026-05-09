#!/usr/bin/env node
// ─── Kyra MCP Server ────────────────────────────────────────────────
// Thin wrapper over the REST API. 6 tools, coarse-grained.
// Tool descriptions are the UI — agents read these to decide what to call.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = process.env.KYRA_API_URL || "http://localhost:3737/api/v1";
const API_KEY = process.env.KYRA_API_KEY || "";

// ─── HTTP client to the REST API ────────────────────────────────────

async function callAPI(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kyra API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function getAPI(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-API-Key": API_KEY },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kyra API error ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── MCP Server ─────────────────────────────────────────────────────

const server = new McpServer({
  name: "kyra-brand",
  version: "0.1.0",
});

// ─── Tool 1: validate_artifact ──────────────────────────────────────

server.tool(
  "validate_artifact",
  `Check any content artifact against a company's brand guidelines. Returns a structured violation report with severity, confidence, location, and fix suggestions for each issue found. Covers colors, typography, voice/vocabulary, reading level, logo usage, composition, and regulatory disclaimers. Use this before publishing any content to ensure brand compliance.`,
  {
    brand_id: z.string().uuid().describe("The brand ID to validate against"),
    content: z.string().describe("The text, HTML, or base64-encoded image to validate"),
    content_type: z.enum(["text", "image", "html", "url"]).describe("Type of content being validated"),
    channel: z.string().optional().describe("Target channel (e.g. 'linkedin', 'press-release') for channel-specific rules"),
  },
  async ({ brand_id, content, content_type, channel }) => {
    const result = await callAPI("/validate", {
      brandId: brand_id,
      artifact: { type: content_type, content, channel },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ─── Tool 2: transform_artifact ─────────────────────────────────────

server.tool(
  "transform_artifact",
  `Fix brand violations in a content artifact. Takes content and a list of operations (recolor, rewrite-voice, simplify-reading-level, add-disclaimer, etc.) and returns the corrected version. Use after validate_artifact identifies issues, or proactively to adapt content for brand compliance.`,
  {
    brand_id: z.string().uuid().describe("The brand ID"),
    content: z.string().describe("The content to transform"),
    content_type: z.enum(["text", "image", "html"]).describe("Type of content"),
    operations: z.array(z.enum([
      "recolor", "rewrite-voice", "simplify-reading-level",
      "fix-spacing", "fix-typography", "add-disclaimer", "auto-fix-violations",
    ])).describe("List of transformation operations to apply"),
  },
  async ({ brand_id, content, content_type, operations }) => {
    const result = await callAPI("/transform", {
      brandId: brand_id,
      artifact: { type: content_type, content },
      operations: operations.map((type) => ({ type })),
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ─── Tool 3: get_brand_context ──────────────────────────────────────

server.tool(
  "get_brand_context",
  `Get brand grounding context for content generation. Returns voice rules, tone parameters, banned vocabulary, approved exemplars, and required disclaimers formatted as a system prompt augmentation. Call this BEFORE generating any branded content so your output is on-brand from the start rather than corrected after.`,
  {
    brand_id: z.string().uuid().describe("The brand ID"),
    content_type: z.string().describe("What you're generating: 'press-release', 'social-post', 'email', 'ad-copy', etc."),
    channel: z.string().optional().describe("Target channel for channel-specific rules"),
    audience: z.string().optional().describe("Target audience for tone calibration"),
  },
  async ({ brand_id, content_type, channel, audience }) => {
    const result = await callAPI("/ground", {
      brandId: brand_id,
      context: { type: content_type, channel, audience },
      include: ["all"],
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ─── Tool 4: lookup_token ───────────────────────────────────────────

server.tool(
  "lookup_token",
  `Look up a specific design token value (color, font, spacing, etc.) from the brand's token set. Use when you need the exact hex color, font family, spacing value, or other design token for a brand. Returns the W3C Design Token format value.`,
  {
    brand_id: z.string().uuid().describe("The brand ID"),
    token_path: z.string().optional().describe("Dot-notation path like 'color.primary.500' or 'spacing.lg'. Omit to get all tokens."),
  },
  async ({ brand_id, token_path }) => {
    const result = await getAPI(`/brands/${brand_id}/tokens${token_path ? `?path=${token_path}` : ""}`);

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ─── Tool 5: find_asset ─────────────────────────────────────────────

server.tool(
  "find_asset",
  `Search the brand's approved asset library for logos, icons, illustrations, or photography. Returns asset URLs with usage metadata including clear-space rules, minimum sizes, and approved backgrounds. Use when you need to reference or include a brand asset.`,
  {
    brand_id: z.string().uuid().describe("The brand ID"),
    query: z.string().optional().describe("Search query: asset name, type, or tag"),
    asset_type: z.enum(["logo", "icon", "photography", "illustration", "pattern", "video", "audio"]).optional(),
  },
  async ({ brand_id }) => {
    const result = await getAPI(`/brands/${brand_id}/assets`);

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ─── Tool 6: get_voice_rules ────────────────────────────────────────

server.tool(
  "get_voice_rules",
  `Get the brand's complete voice and vocabulary rules. Returns approved and banned vocabulary, tone parameters per channel, reading level targets, and required disclaimers. Use when writing or reviewing text content to ensure it matches the brand voice.`,
  {
    brand_id: z.string().uuid().describe("The brand ID"),
    channel: z.string().optional().describe("Get channel-specific voice rules if available"),
  },
  async ({ brand_id }) => {
    const result = await getAPI(`/brands/${brand_id}/voice`);

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);


// ─── Tool 7: run_compliance_scorecard ───────────────────────────────

server.tool(
  "run_compliance_scorecard",
  `Run a component's code against the Husqvarna design system compliance engine. Validates JSX/HTML code for a specific component (Button, Input, Card, etc.) against design tokens, spacing rules, color palette, typography, and forbidden patterns. Returns a score out of 100 with individual check results.`,
  {
    component_name: z.string().describe("Component name to validate: Button, Input, Card, etc."),
    code: z.string().describe("The JSX or HTML code of the component to validate"),
  },
  async ({ component_name, code }) => {
    const complianceUrl = process.env.COMPLIANCE_API_URL || "http://localhost:8000";
    const res = await fetch(`${complianceUrl}/compliance-scorecard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ component_name, code }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Compliance API error ${res.status}: ${text}`);
    }

    const result = await res.json();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);


// ─── Start ──────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kyra MCP server running on stdio");
}

main().catch(console.error);
