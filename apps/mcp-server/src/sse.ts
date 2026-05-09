#!/usr/bin/env node
// ─── Kyra MCP Server (HTTP/SSE transport) ───────────────────────────
// Exposes the same 7 tools over HTTP for ChatGPT, remote clients, etc.

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
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

// ─── Create MCP server with all tools ───────────────────────────────

function createServer(): McpServer {
  const server = new McpServer({
    name: "kyra-brand",
    version: "0.1.0",
  });

  server.tool(
    "validate_artifact",
    `Check any content artifact against Husqvarna's brand guidelines. Returns a structured violation report with severity, confidence, location, and fix suggestions. Covers colors, typography, voice/vocabulary, reading level, logo usage, composition, and regulatory disclaimers.`,
    {
      brand_id: z.string().uuid().describe("The brand ID to validate against"),
      content: z.string().describe("The text, HTML, or base64-encoded image to validate"),
      content_type: z.enum(["text", "image", "html", "url"]).describe("Type of content"),
      channel: z.string().optional().describe("Target channel for channel-specific rules"),
    },
    async ({ brand_id, content, content_type, channel }) => {
      const result = await callAPI("/validate", {
        brandId: brand_id,
        artifact: { type: content_type, content, channel },
      });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "transform_artifact",
    `Fix brand violations in a content artifact. Takes content and a list of operations and returns the corrected version.`,
    {
      brand_id: z.string().uuid().describe("The brand ID"),
      content: z.string().describe("The content to transform"),
      content_type: z.enum(["text", "image", "html"]).describe("Type of content"),
      operations: z.array(z.enum([
        "recolor", "rewrite-voice", "simplify-reading-level",
        "fix-spacing", "fix-typography", "add-disclaimer", "auto-fix-violations",
      ])).describe("Transformation operations to apply"),
    },
    async ({ brand_id, content, content_type, operations }) => {
      const result = await callAPI("/transform", {
        brandId: brand_id,
        artifact: { type: content_type, content },
        operations: operations.map((type) => ({ type })),
      });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_brand_context",
    `Get brand grounding context for content generation. Returns voice rules, tone parameters, banned vocabulary, approved exemplars, and required disclaimers.`,
    {
      brand_id: z.string().uuid().describe("The brand ID"),
      content_type: z.string().describe("What you're generating: press-release, social-post, email, etc."),
      channel: z.string().optional().describe("Target channel"),
      audience: z.string().optional().describe("Target audience"),
    },
    async ({ brand_id, content_type, channel, audience }) => {
      const result = await callAPI("/ground", {
        brandId: brand_id,
        context: { type: content_type, channel, audience },
        include: ["all"],
      });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "lookup_token",
    `Look up a specific design token value (color, font, spacing, etc.) from the brand's token set.`,
    {
      brand_id: z.string().uuid().describe("The brand ID"),
      token_path: z.string().optional().describe("Dot-notation path like 'color.primary.500'"),
    },
    async ({ brand_id, token_path }) => {
      const result = await getAPI(`/brands/${brand_id}/tokens${token_path ? `?path=${token_path}` : ""}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "find_asset",
    `Search the brand's approved asset library for logos, icons, illustrations, or photography.`,
    {
      brand_id: z.string().uuid().describe("The brand ID"),
      query: z.string().optional().describe("Search query"),
      asset_type: z.enum(["logo", "icon", "photography", "illustration", "pattern", "video", "audio"]).optional(),
    },
    async ({ brand_id }) => {
      const result = await getAPI(`/brands/${brand_id}/assets`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_voice_rules",
    `Get the brand's complete voice and vocabulary rules including approved/banned vocabulary and tone parameters.`,
    {
      brand_id: z.string().uuid().describe("The brand ID"),
      channel: z.string().optional().describe("Channel-specific voice rules"),
    },
    async ({ brand_id }) => {
      const result = await getAPI(`/brands/${brand_id}/voice`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "run_compliance_scorecard",
    `Run a component's code against the Husqvarna design system compliance engine. Validates JSX/HTML code for a specific component against design tokens, spacing, colors, typography, and forbidden patterns. Returns a score out of 100.`,
    {
      component_name: z.string().describe("Component name: Button, Input, Card, etc."),
      code: z.string().describe("The JSX or HTML code to validate"),
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
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  return server;
}

// ─── Express SSE server ─────────────────────────────────────────────

const app = express();
const transports: Record<string, SSEServerTransport> = {};

app.get("/health", (_req, res) => {
  res.json({ status: "ok", transport: "sse", tools: 7 });
});

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  const server = createServer();
  await server.connect(transport);

  res.on("close", () => {
    delete transports[transport.sessionId];
  });
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (!transport) {
    res.status(400).json({ error: "Unknown session" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

const port = parseInt(process.env.PORT || "3838");
app.listen(port, () => {
  console.log(`Kyra MCP SSE server running on http://localhost:${port}`);
});
