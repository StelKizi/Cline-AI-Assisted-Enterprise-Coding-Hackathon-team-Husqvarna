import { NextResponse } from "next/server";
import { loadComponents } from "@/lib/kyra/data";

/** Mirrors MCP `get_component_spec`. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name: rawName } = await context.params;
  const name = decodeURIComponent(rawName ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Component name required" }, { status: 400 });
  }

  try {
    const components = await loadComponents();
    const spec = components[name];
    if (!spec) {
      return NextResponse.json(
        {
          error: "component_not_found",
          component: name,
          available: Object.keys(components),
        },
        { status: 404 },
      );
    }
    return NextResponse.json(spec);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load component";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
