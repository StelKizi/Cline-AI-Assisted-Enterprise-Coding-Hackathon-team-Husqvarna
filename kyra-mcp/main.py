import json
import os
import re
from pathlib import Path
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("kyra")

# ---------------------------------------------------------------------------
# Brand loading engine (Brand Agnostic)
# ---------------------------------------------------------------------------

def get_brand_dir(brand: str | None = None) -> Path:
    """
    Resolve the design system / brand directory dynamically.
    Priority:
      1. KYRA_BRAND_DIR environment variable (explicit folder path)
      2. brand parameter passed to tool or KYRA_BRAND environment variable
      3. Repository brands/<brand> directory
      4. Default design_system directory
    """
    # 1. Explicit folder path via environment
    if env_dir := os.getenv("KYRA_BRAND_DIR"):
        p = Path(env_dir)
        if p.exists():
            return p

    # 2. Specified brand name (via argument or KYRA_BRAND env)
    brand_name = brand or os.getenv("KYRA_BRAND")
    if brand_name:
        candidates = [
            Path(brand_name),
            Path(__file__).parent / "brands" / brand_name,
            Path(__file__).parent.parent / "brands" / brand_name,
        ]
        for c in candidates:
            if c.exists() and c.is_dir():
                return c

    # 3. Fallback: design_system or brands/acme
    default_ds = Path(__file__).parent / "design_system"
    if default_ds.exists():
        return default_ds

    default_acme = Path(__file__).parent.parent / "brands" / "acme"
    if default_acme.exists():
        return default_acme

    return Path(__file__).parent / "design_system"


def load_tokens(brand: str | None = None) -> dict:
    ds_path = get_brand_dir(brand)
    tokens_file = ds_path / "tokens.json"
    if not tokens_file.exists():
        return {"error": f"Tokens file not found at {tokens_file}"}
    return json.loads(tokens_file.read_text())


def load_components(brand: str | None = None) -> dict:
    ds_path = get_brand_dir(brand)
    components_file = ds_path / "components.json"
    if not components_file.exists():
        return {"error": f"Components file not found at {components_file}"}
    return json.loads(components_file.read_text())


# ---------------------------------------------------------------------------
# MCP tools — each function becomes a tool the AI agent can call.
# Docstrings are the tool descriptions surfaced to the agent; keep them clear.
# Return type is always str: MCP tool results are plain strings, not dicts.
# ---------------------------------------------------------------------------

@mcp.tool()
def get_tokens(brand: str | None = None) -> str:
    """Get all design tokens (colors, spacing, typography, border radius) for a brand.
    
    Args:
        brand: Optional brand name or directory (e.g. 'acme', 'husqvarna'). Defaults to active brand config.
    """
    tokens = load_tokens(brand)
    return json.dumps(tokens, indent=2)


@mcp.tool()
def get_component_spec(component_name: str, brand: str | None = None) -> str:
    """
    Get the full contract for a design system component under the active or specified brand.
    Returns allowed variants, sizes, props, color tokens, and usage examples.
    """
    components = load_components(brand)
    name = component_name.strip()

    if name not in components:
        available = list(components.keys())
        return f"Component '{name}' not found. Available: {available}"

    spec = components[name]
    return json.dumps(spec, indent=2)


@mcp.tool()
def list_components(brand: str | None = None) -> str:
    """List all available components in the design system for the active brand."""
    components = load_components(brand)
    if "error" in components:
        return components["error"]
    result = []
    for name, spec in components.items():
        if name.startswith("_"):
            continue
        desc = spec.get("description", "Component") if isinstance(spec, dict) else "Component"
        result.append(f"- {name}: {desc}")
    return "\n".join(result) if result else "No components defined."


@mcp.tool()
def audit_context(component_name: str, intent: str, brand: str | None = None) -> str:
    """
    Get generation constraints before writing UI code for a specific brand.
    Call this BEFORE generating a component to get the rules the AI must follow.

    Args:
        component_name: Name of the component to generate (e.g. "Button")
        intent: What you're trying to do (e.g. "primary submit button for signup form")
        brand: Optional brand name (e.g. 'acme', 'husqvarna'). Defaults to active brand config.
    """
    components = load_components(brand)
    name = component_name.strip()

    if name not in components:
        available = list(components.keys())
        return f"Component '{name}' not found. Available: {available}"

    spec = components[name]

    # Build a focused constraint envelope — only the fields the agent needs
    rules = {
        "component": name,
        "intent": intent,
        "constraints": {
            "required_props": spec.get("required_props", []),
            "allowed_variants": spec.get("allowed_variants", []),
            "allowed_sizes": spec.get("allowed_sizes", []),
            "allowed_color_tokens": spec.get("allowed_color_tokens", []),
            "forbidden_patterns": spec.get("forbidden_patterns", []),
            "allowed_props": spec.get("allowed_props", []),
        },
        "correct_example": spec.get("examples", {}).get("correct") if "examples" in spec else None,
        "incorrect_example": spec.get("examples", {}).get("incorrect") if "examples" in spec else None,
        "instruction": (
            f"Use only allowed_variants and allowed_sizes. "
            f"Reference colors by token name only (e.g. color.brand.primary). "
            f"Never use hardcoded hex, rgb, or inline styles. "
            f"Always include required_props: {spec.get('required_props', [])}."
        ),
    }

    return json.dumps(rules, indent=2)


@mcp.tool()
def run_compliance_scorecard(component_name: str, code: str, brand: str | None = None) -> str:
    """
    Validate generated UI code against design system constraints for a brand.
    Call this AFTER generating a component to check if it's compliant.

    Args:
        component_name: Name of the component that was generated (e.g. "Button")
        code: The generated JSX/HTML code to validate
        brand: Optional brand name or directory (e.g. 'acme', 'husqvarna')
    """
    components = load_components(brand)
    name = component_name.strip()

    if name not in components:
        available = list(components.keys())
        return f"Component '{name}' not found. Available: {available}"

    spec = components[name]
    checks = []
    passed = 0
    total = 0

    # Check 1: variant prop exists and its value is in the allowed set.
    if "allowed_variants" in spec:
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

    # Check 2: forbidden patterns check
    total += 1
    violations = []
    for pattern in spec.get("forbidden_patterns", []):
        if pattern in code:
            violations.append(f'"{pattern}"')
    if violations:
        checks.append(f'✗ Token check — forbidden patterns found: {", ".join(violations)}. Use design tokens instead.')
    else:
        checks.append('✓ Token check — no hardcoded styles or forbidden patterns')
        passed += 1

    # Check 3: hex colors check
    total += 1
    hex_colors = re.findall(r'#[0-9A-Fa-f]{3,6}', code)
    if hex_colors:
        checks.append(f'✗ Color token check — hardcoded colors found: {hex_colors}. Use color tokens.')
    else:
        checks.append('✓ Color token check — no hardcoded hex colors')
        passed += 1

    # Check 4: raw HTML tag vs component tag check
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
        failing = [c for c in checks if c.startswith("✗")]
        fixes = []
        for f in failing:
            if "Variant" in f:
                fixes.append(f'Use variant="{spec.get("allowed_variants", ["primary"])[0]}"')
            if "Token check" in f or "Color token" in f:
                fixes.append(f'Replace inline styles/colors with design tokens: {spec.get("allowed_color_tokens", [])[:2]}')
            if "Structure" in f:
                fixes.append(f'Use <{name}> component, not raw HTML')
        summary += "\n\nRequired fixes:\n" + "\n".join(f"→ {fix}" for fix in fixes)

    return summary


def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
