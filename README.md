# Kyra — Brand Intelligence Platform

> API-first brand state management with validation, transformation, and AI grounding.

Kyra treats **brand guidelines as structured, versionable state** — not PDFs. Every color, voice rule, and asset lives in a typed schema that any tool can query and validate against.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Brand Core                       │
│  W3C Design Tokens · Voice Rules · Asset Registry   │
│  Component Patterns · Policies · Audit Log          │
└──────────────┬──────────────────┬───────────────────┘
               │                  │
        ┌──────▼──────┐   ┌──────▼──────┐
        │  REST API   │   │  MCP Server │
        │  (Hono)     │   │  (stdio)    │
        │  :3737      │   │             │
        └──────┬──────┘   └──────┬──────┘
               │                  │
     ┌─────────┼─────────┐       │
     ▼         ▼         ▼       ▼
  Console   Figma     CI/CD    Claude /
  (Next.js) Plugin    Actions  Any LLM
  :3838
```

## Packages

| Package | Description |
|---|---|
| `packages/brand-core` | Zod schemas for tokens, voice, assets, patterns, policies, audit |
| `apps/api` | Hono REST API — `/validate`, `/transform`, `/ground` |
| `apps/mcp-server` | Model Context Protocol server (6 tools) for AI agent integration |
| `apps/console` | Next.js dashboard — activity, compliance scorecard, token browser |
| `plugins/figma` | Figma plugin — real-time brand validation on canvas |
| `kyra-mcp` | Python FastMCP server with compliance engine (Mark's contribution) |

## Quick Start

```bash
# Install dependencies
npm install

# Start the REST API
npm run api:dev        # → http://localhost:3737

# Start the console
npm run console:dev    # → http://localhost:3838

# Start Mark's Python compliance API
cd kyra-mcp && uv run python api.py   # → http://localhost:8000

# Use the MCP server (stdio — connect from Claude Desktop, Cursor, etc.)
npm run mcp:dev
```

## Key Endpoints

### REST API (`:3737`)
- `POST /v1/validate` — Run artifact through checker pipeline, get scored violations
- `POST /v1/transform` — Auto-fix violations (recolor, rewrite voice, etc.)
- `POST /v1/ground` — Generate system prompt for AI tools with brand context

### MCP Server (stdio)
- `validate_artifact` — Brand-check any content
- `transform_artifact` — Auto-fix brand violations
- `get_brand_context` — Full brand state for grounding
- `lookup_token` — Query specific design tokens
- `find_asset` — Search asset registry
- `get_voice_rules` — Voice & tone rules for a channel

### Python Compliance API (`:8000`)
- `POST /compliance-scorecard` — Run component code against design system spec

## Console Pages

| Route | Page |
|---|---|
| `/` | Activity — validation stats, drift reports, live feed |
| `/compliance` | Compliance Scorecard — component validation against design system |
| `/tokens` | Design Tokens — color, spacing, typography browser |
| `/voice` | Voice & Tone — vocabulary rules, tone parameters |
| `/assets` | Assets — managed brand assets with approval workflow |
| `/audit` | Audit Log — every Brand Core change, timestamped |
| `/settings` | Settings — API keys, plan usage, integrations |

## Tech Stack

- **Monorepo**: npm workspaces + Turborepo
- **Schemas**: Zod (TypeScript) — W3C Design Token format
- **API**: Hono (lightweight, edge-ready)
- **MCP**: `@modelcontextprotocol/sdk` (stdio transport)
- **Console**: Next.js 16, React 19, Tailwind v4, Lucide icons
- **Compliance Engine**: Python FastMCP + FastAPI
- **Figma Plugin**: Canvas API + esbuild

## Team

Built for the Cline AI-Assisted Enterprise Coding Hackathon — Team Husqvarna.
