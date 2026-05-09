# Kyra MCP

Kyra is an MCP server that connects AI coding agents (Cline) to a design system. It exposes design tokens and component contracts as callable tools, and validates AI-generated UI code against those contracts before it lands in the codebase.

**Problem it solves:** AI agents generate UI that looks visually correct but silently breaks design tokens, spacing rules, and component contracts — wrong variant names, hardcoded hex colors, raw HTML instead of design system components. Kyra gives agents the rules before they write, and catches violations after.

---

## Project structure

```
kyra-mcp/
├── main.py                 # FastMCP server — all tools defined here
├── design_system/
│   ├── tokens.json         # design tokens: colors, spacing, typography
│   └── components.json     # component contracts: variants, props, forbidden patterns
└── pyproject.toml
```

---

## Available tools

| Tool | When to call | Description |
|------|-------------|-------------|
| `list_components` | anytime | lists available components |
| `get_tokens` | anytime | returns all design tokens |
| `get_component_spec(name)` | anytime | full contract for a component |
| `audit_context(component, intent)` | BEFORE generating | returns constraints the agent must follow |
| `run_compliance_scorecard(component, code)` | AFTER generating | validates one component; `variant` is read from the **first** `<Component …>` tag in `code` |
| `run_compliance_bundle(code)` | AFTER multi-component JSX | discovers all `<Button>`, `<Input>`, … tags and runs the same checks **once per component type**; returns JSON with overall PASS/FAIL |
| `read_asset(path, max_chars?, max_bytes?)` | anytime | reads assets under `kyra-mcp/` (md/json, images as base64, pdf/pptx as extracted text) |

---

## Workflow

Cline <-> Kyra loop, using a Button as example:

1. User asks for a primary submit button
2. Cline calls `audit_context("Button", "primary submit")`
3. Kyra returns allowed variants, tokens, forbidden patterns, and examples
4. Cline generates the component code
5. Cline calls `run_compliance_scorecard("Button", <generated code>)`
6. If FAIL — Kyra returns specific fixes — Cline revises and retries
7. If PASS — compliant code is ready

---

## Setup & running

```bash
# Install deps
uv sync

# Run server (stdio — used by Cline)
uv run python main.py

# Run with MCP inspector (dev/debug)
uv run mcp dev main.py
```

Python version: 3.14 (managed via `.python-version`). Package manager: `uv`.

---

## Cline configuration

Add to `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "kyra": {
      "command": "/Users/marktaratynov/.local/bin/uv",
      "args": [
        "run",
        "--directory",
        "/path/to/kyra-mcp",
        "python",
        "main.py"
      ]
    }
  }
}
```

Replace `/path/to/kyra-mcp` with the absolute path to this directory.

---

## Extending

- **Add components:** edit `design_system/components.json` — follow the existing structure (description, variants, sizes, props, forbidden_patterns, examples)
- **Add tokens:** edit `design_system/tokens.json`
- **Real Figma integration:** replace `load_components()` / `load_tokens()` with a Figma API adapter — the tool interface stays the same, no changes to `main.py` needed
