import path from "path";

/**
 * Root of the Python `kyra-mcp` package (contains `design_system/` and `main.py`).
 * Override when the dashboard is not deployed next to `kyra-mcp` in the repo layout.
 */
export function getKyraMcpRoot(): string {
  const env = process.env.KYRA_MCP_ROOT?.trim();
  if (env) return path.resolve(env);
  return path.resolve(process.cwd(), "..", "kyra-mcp");
}

export function getDesignSystemDir(): string {
  return path.join(getKyraMcpRoot(), "design_system");
}
