# CLAUDE.md

This file provides guidance to AI assistants working with code in this repository.

## Project: Kyra (Brand Intelligence Platform)

Kyra is an API-first, **brand-agnostic** brand state management and compliance engine with MCP (Model Context Protocol) integration.

### Core Capabilities
- **Brand Agnostic Architecture**: Accepts any brand guidelines defined as JSON schemas (`tokens.json` & `components.json`) under `brands/<brand-name>/` or via `KYRA_BRAND_DIR`.
- **MCP Servers**: Python FastMCP (`kyra-mcp`) and Node.js MCP (`apps/mcp-server`) for AI agent integration.
- **REST API**: Hono REST API (`apps/api`) providing `/validate`, `/transform`, `/ground`, and `/brands` endpoints.
- **Dashboard Console**: Next.js 16 app (`apps/console`) for compliance scorecards and token browsing.

---

## Commands & Setup

### Python Compliance Engine (`kyra-mcp`)

```bash
cd kyra-mcp

# Install dependencies
uv sync

# Run Python MCP server (stdio transport for Claude Desktop / Cursor)
uv run python main.py

# Run FastAPI compliance server (HTTP endpoint at http://localhost:8000)
uv run python api.py
```

### TypeScript Workspace & Server (`apps/mcp-server`, `apps/api`, `apps/console`)

```bash
# Root directory
npm install

# Run REST API (:3737)
npm run api:dev

# Run Console (:3838)
npm run console:dev

# Run Node.js MCP server
npm run mcp:dev
```

---

## Brand Selection & Dynamic Loading

Kyra dynamically loads brands based on:
1. `KYRA_BRAND_DIR`: Explicit folder path to brand design tokens & component contracts.
2. `KYRA_BRAND`: Name of folder inside `brands/` (e.g. `KYRA_BRAND=acme` or `KYRA_BRAND=husqvarna`).
3. Tool parameter: `brand` passed in tool invocation (e.g. `run_compliance_scorecard(component_name="Button", code="...", brand="acme")`).

---

## Repository Structure

```
├── brands/                 # Multi-brand specifications (acme, husqvarna, custom)
│   ├── acme/               # Example Acme brand spec
│   └── husqvarna/          # Husqvarna Forest & Garden brand spec
├── kyra-mcp/               # Python FastMCP server & compliance engine
│   ├── main.py             # FastMCP stdio server
│   ├── api.py              # FastAPI HTTP server (:8000)
│   └── design_system/      # Default design system fallback
├── apps/
│   ├── api/                # Hono REST API server (:3737)
│   ├── mcp-server/         # TypeScript stdio MCP server
│   └── console/            # Next.js 16 management dashboard (:3838)
└── packages/
    └── brand-core/         # Zod schemas for W3C tokens & brand rules
```
