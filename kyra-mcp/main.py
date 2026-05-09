import json
import re
from pathlib import Path
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("kyra")

# Resolve design_system/ relative to this file, not the process cwd.
# Claude Desktop (and uv run) can launch the process from any working directory,
# so __file__.parent is the only reliable anchor.
DS_PATH = Path(__file__).parent / "design_system"


# ---------------------------------------------------------------------------
# Data loading helpers
# ---------------------------------------------------------------------------

def load_tokens() -> dict:
    # Read fresh from disk on every call — no caching intentional,
    # so hot-edits to tokens.json are reflected without restarting the server.
    return json.loads((DS_PATH / "tokens.json").read_text())

def load_components() -> dict:
    return json.loads((DS_PATH / "components.json").read_text())


# ---------------------------------------------------------------------------
# MCP tools — each function becomes a tool the AI agent can call.
# Docstrings are the tool descriptions surfaced to the agent; keep them clear.
# Return type is always str: MCP tool results are plain strings, not dicts.
# ---------------------------------------------------------------------------

@mcp.tool()
def get_tokens() -> str:
    """Get all design tokens: colors, spacing, typography, border radius."""
    tokens = load_tokens()
    return json.dumps(tokens, indent=2)


@mcp.tool()
def get_component_spec(component_name: str) -> str:
    """
    Get the full contract for a design system component.
    Returns allowed variants, sizes, props, color tokens, and usage examples.
    """
    components = load_components()
    name = component_name.strip()

    if name not in components:
        available = list(components.keys())
        return f"Component '{name}' not found. Available: {available}"

    spec = components[name]
    return json.dumps(spec, indent=2)


@mcp.tool()
def list_components() -> str:
    """List all available components in the design system."""
    components = load_components()
    result = []
    for name, spec in components.items():
        result.append(f"- {name}: {spec['description']}")
    return "\n".join(result)


@mcp.tool()
def audit_context(component_name: str, intent: str) -> str:
    """
    Get generation constraints before writing UI code.
    Call this BEFORE generating a component to get the rules the AI must follow.

    Args:
        component_name: Name of the component to generate (e.g. "Button")
        intent: What you're trying to do (e.g. "primary submit button for signup form")
    """
    components = load_components()
    name = component_name.strip()

    if name not in components:
        available = list(components.keys())
        return f"Component '{name}' not found. Available: {available}"

    spec = components[name]

    # Build a focused constraint envelope — only the fields the agent needs
    # before writing code. The full spec (get_component_spec) has more detail
    # but also more noise; this keeps the context window lean.
    rules = {
        "component": name,
        "intent": intent,
        "constraints": {
            "required_props": spec["required_props"],
            "allowed_variants": spec["allowed_variants"],
            "allowed_sizes": spec["allowed_sizes"],
            "allowed_color_tokens": spec["allowed_color_tokens"],
            "forbidden_patterns": spec["forbidden_patterns"],
            "allowed_props": spec["allowed_props"],
        },
        # Positive + negative examples help the agent pattern-match faster
        # than reading a list of rules.
        "correct_example": spec["examples"]["correct"],
        "incorrect_example": spec["examples"]["incorrect"],
        "instruction": (
            f"Use only allowed_variants and allowed_sizes. "
            f"Reference colors by token name only (e.g. color.brand.primary). "
            f"Never use hardcoded hex, rgb, or inline styles. "
            f"Always include required_props: {spec['required_props']}."
        ),
    }

    # JSON string, not a dict — MCP tool results must be serializable strings.
    return json.dumps(rules, indent=2)


@mcp.tool()
def run_compliance_scorecard(component_name: str, code: str) -> str:
    """
    Validate generated UI code against design system constraints.
    Call this AFTER generating a component to check if it's compliant.

    Args:
        component_name: Name of the component that was generated (e.g. "Button")
        code: The generated JSX/HTML code to validate
    """
    components = load_components()
    name = component_name.strip()

    if name not in components:
        available = list(components.keys())
        return f"Component '{name}' not found. Available: {available}"

    spec = components[name]
    checks = []
    passed = 0
    total = 0

    # Check 1: variant prop exists and its value is in the allowed set.
    # Catches the most common mistake: agents inventing variant names
    # (e.g. "default", "filled") that the design system doesn't define.
    total += 1
    variant_match = re.search(r'variant=["\']([^"\']+)["\']', code)
    if not variant_match:
        checks.append(f'✗ Variant check — variant prop missing. Required. Allowed: {spec["allowed_variants"]}')
    elif variant_match.group(1) not in spec["allowed_variants"]:
        used = variant_match.group(1)
        checks.append(f'✗ Variant check — "{used}" not in {spec["allowed_variants"]}')
    else:
        checks.append(f'✓ Variant check — "{variant_match.group(1)}" is valid')
        passed += 1

    # Check 2: none of the forbidden_patterns from the spec appear verbatim.
    # These are literal strings like `style={{`, `className="btn"`, etc. —
    # patterns the spec explicitly bans because they bypass the token system.
    total += 1
    violations = []
    for pattern in spec["forbidden_patterns"]:
        if pattern in code:
            violations.append(f'"{pattern}"')
    if violations:
        checks.append(f'✗ Token check — forbidden patterns found: {", ".join(violations)}. Use design tokens instead.')
    else:
        checks.append('✓ Token check — no hardcoded styles or forbidden patterns')
        passed += 1

    # Check 3: no raw hex color literals.
    # Agents sometimes inline colors they "know" (#3B82F6, #fff) instead of
    # referencing tokens. The regex catches 3- and 6-digit hex forms.
    total += 1
    hex_colors = re.findall(r'#[0-9A-Fa-f]{3,6}', code)
    if hex_colors:
        checks.append(f'✗ Color token check — hardcoded colors found: {hex_colors}. Use color tokens.')
    else:
        checks.append('✓ Color token check — no hardcoded hex colors')
        passed += 1

    # Check 4: the design system component tag is used, not the raw HTML element.
    # Strategy: look for the raw tag (e.g. `<button`) in lowercased code,
    # but only flag it if the proper component tag (`<Button`) is absent —
    # the component's own implementation may render `<button` internally,
    # and we don't want to penalize that string appearing in JSX comments or
    # inside the component file itself. The dual condition (raw present AND
    # component absent) distinguishes "agent wrote raw HTML" from "agent
    # wrote the component which happens to contain the raw tag string".
    total += 1
    lower_code = code.lower()
    raw_tags = {"button": "<button", "input": "<input", "card": "<div"}
    raw_tag = raw_tags.get(name.lower())
    if raw_tag and raw_tag in lower_code and f"<{name}" not in code:
        checks.append(f'✗ Structure check — raw HTML "{raw_tag}" used instead of <{name}> component')
    else:
        checks.append(f'✓ Structure check — <{name}> component used correctly')
        passed += 1

    status = "PASS" if passed == total else "FAIL"
    summary = f"Result: {status} ({passed}/{total} checks)\n\n" + "\n".join(checks)

    if status == "FAIL":
        # Surface actionable fixes, not just failure labels, so the agent
        # can correct the code in one shot without needing to re-query the spec.
        failing = [c for c in checks if c.startswith("✗")]
        fixes = []
        for f in failing:
            if "Variant" in f:
                fixes.append(f'Use variant="{spec["allowed_variants"][0]}"')
            if "Token check" in f or "Color token" in f:
                fixes.append(f'Replace inline styles/colors with design tokens: {spec["allowed_color_tokens"][:2]}')
            if "Structure" in f:
                fixes.append(f'Use <{name}> component, not raw HTML')
        summary += "\n\nRequired fixes:\n" + "\n".join(f"→ {fix}" for fix in fixes)

    return summary


def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
