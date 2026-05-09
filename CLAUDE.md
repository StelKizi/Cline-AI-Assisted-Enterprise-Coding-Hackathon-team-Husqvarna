# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MCP server practice repo. Currently contains one project: `Cline-AI-Assisted-Enterprise-Coding-Hackathon-team-Husqvarna/` — a FastMCP weather server wrapping the US National Weather Service API.

## Commands

All commands run from the project subdirectory (e.g. `Cline-AI-Assisted-Enterprise-Coding-Hackathon-team-Husqvarna/`).

```bash
# Install deps
uv sync

# Run MCP server (stdio transport)
uv run python main.py

# Run as MCP dev server (with inspector)
uv run mcp dev main.py

# Install into Claude Desktop
uv run mcp install main.py
```

Python version: 3.14 (managed via `.python-version`). Package manager: `uv`.

## Architecture

`main.py` is the entire server. Pattern: `FastMCP` instance → `@mcp.tool()` decorators → `mcp.run(transport="stdio")`.

Tool flow for `get_forecast`: NWS `/points/{lat},{lon}` → extract `forecast` URL → fetch periods → return top 5.

`make_nws_request` is shared async helper; swallows all exceptions and returns `None` on failure — callers check for `None`.

Transport is stdio (Claude Desktop / MCP client launches the process).
