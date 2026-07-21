# Kyra — Brand Intelligence Platform

> API-first, **brand-agnostic** brand state management with validation, transformation, compliance checks, and AI grounding.

Kyra treats **brand guidelines as structured, versionable state** — not static PDFs. Any company or design team can input their brand specs, and any AI tool or agent can query, ground, and validate UI component code or brand artifacts against those guidelines via the Model Context Protocol (MCP) or REST API.

---

## 🚀 Brand Agnostic Engine

Kyra is 100% brand-agnostic. The validation engine and MCP servers accept **any brand input**.

### 1. Structure Your Brand State
Place your brand specification inside `brands/<your-brand-name>/`:

```
brands/
├── acme/                  # Example Acme brand
│   ├── tokens.json        # W3C Design Tokens (colors, spacing, typography)
│   └── components.json    # Component specs & compliance contracts
├── husqvarna/             # Husqvarna Forest & Garden spec
│   ├── tokens.json
│   └── components.json
└── your-brand/            # Create your own custom brand!
    ├── tokens.json
    └── components.json
```

### 2. Configure Active Brand
You can select a brand in 3 easy ways:
- **Environment Variable**: Set `KYRA_BRAND=acme` or `KYRA_BRAND_DIR=/path/to/custom/brand`
- **MCP Tool Argument**: Pass `brand="acme"` or `brand="husqvarna"` directly when invoking MCP tools
- **REST API Header / Parameter**: Request `/v1/brands/acme/tokens` or pass `brandId`

---

## 🔌 Setting Up the MCP Server

Anyone cloning or viewing this repository can set up the MCP server in seconds for **Claude Desktop**, **Cursor**, **VS Code**, or **Cline**.

### Option A: Python FastMCP Server (`kyra-mcp`)

1. **Install dependencies**:
   ```bash
   cd kyra-mcp && uv sync
   ```

2. **Run locally**:
   ```bash
   uv run python main.py
   ```

3. **Configure in Claude Desktop / Cursor (`claude_desktop_config.json`)**:
   ```json
   {
     "mcpServers": {
       "kyra-mcp": {
         "command": "uv",
         "args": [
           "--directory",
           "/absolute/path/to/kyra/kyra-mcp",
           "run",
           "python",
           "main.py"
         ],
         "env": {
           "KYRA_BRAND": "acme"
         }
       }
     }
   }
   ```

### Option B: TypeScript MCP Server (`apps/mcp-server`)

1. **Install & Build**:
   ```bash
   npm install && npm run build
   ```

2. **Configure in Claude Desktop / Cursor (`claude_desktop_config.json`)**:
   ```json
   {
     "mcpServers": {
       "kyra-brand": {
         "command": "node",
         "args": [
           "/absolute/path/to/kyra/apps/mcp-server/dist/index.js"
         ],
         "env": {
           "KYRA_API_URL": "http://localhost:3737/api/v1",
           "KYRA_BRAND": "acme"
         }
       }
     }
   }
   ```

---

## 🛠️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                           Brand Core                             │
│       W3C Design Tokens · Dynamic Brand Input · Asset Registry    │
│            Component Patterns · Compliance Rules                 │
└────────────────┬────────────────────────────────┬────────────────┘
                 │                                │
          ┌──────▼──────┐                  ┌──────▼──────┐
          │  REST API   │                  │  MCP Server │
          │  (Hono)     │                  │  (stdio)    │
          │  :3737      │                  │             │
          └──────┬──────┘                  └──────┬──────┘
                 │                                │
       ┌─────────┼─────────┐                      │
       ▼         ▼         ▼                      ▼
    Console   Figma     CI/CD                 Claude /
   (Next.js) Plugin    Actions               Any LLM Agent
   :3838
```

---

## 📦 Packages & Repositories

| Package | Description |
|---|---|
| `brands/` | Brand state directory (`acme`, `husqvarna`, custom brands) |
| `kyra-mcp` | Brand-agnostic Python FastMCP server & compliance engine |
| `apps/mcp-server` | Node.js MCP server (7 tools) wrapping the REST API |
| `apps/api` | Hono REST API — `/validate`, `/transform`, `/ground`, `/brands` |
| `packages/brand-core` | Zod schemas for tokens, voice, assets, patterns, policies |
| `apps/console` | Next.js dashboard — compliance scorecard, token browser, live feed |

---

## ⚡ Quick Start Commands

```bash
# Install all dependencies
npm install

# Start the Hono REST API (Port 3737)
npm run api:dev

# Start Next.js Console (Port 3838)
npm run console:dev

# Start Python Compliance API (Port 8000)
cd kyra-mcp && uv run python api.py

# Start stdio MCP Server for AI Agents
npm run mcp:dev
```

---

## 🛠️ Key MCP Tools

- `run_compliance_scorecard`: Validate component JSX/HTML against active brand tokens & rules
- `audit_context`: Fetch constraints & correct examples BEFORE writing code
- `get_tokens`: Query design tokens (colors, typography, spacing) for any brand
- `list_components`: List component contracts in the design system
- `validate_artifact`: Run comprehensive brand compliance check
- `transform_artifact`: Auto-fix brand violations
- `get_brand_context`: System prompt grounding for AI generation
