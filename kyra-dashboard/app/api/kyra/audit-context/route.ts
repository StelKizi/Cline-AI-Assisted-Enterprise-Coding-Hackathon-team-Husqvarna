import { NextResponse } from "next/server";
import { buildAuditContextPayload } from "@/lib/kyra/audit-context";
import { loadComponents } from "@/lib/kyra/data";

/** Mirrors MCP `audit_context`. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const { component_name: componentName, intent } = body as {
    component_name?: unknown;
    intent?: unknown;
  };

  if (typeof componentName !== "string" || !componentName.trim()) {
    return NextResponse.json({ error: "component_name is required" }, { status: 400 });
  }
  if (typeof intent !== "string") {
    return NextResponse.json({ error: "intent must be a string" }, { status: 400 });
  }

  try {
    const components = await loadComponents();
    const name = componentName.trim();
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
    const payload = buildAuditContextPayload(name, intent, spec);
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to build audit context";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
