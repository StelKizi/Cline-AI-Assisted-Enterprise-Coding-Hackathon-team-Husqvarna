import { NextResponse } from "next/server";
import { loadComponents } from "@/lib/kyra/data";
import { runComplianceBundle, runComplianceScorecard } from "@/lib/kyra/scorecard";

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

  const { component_name: componentName, code, scope } = body as {
    component_name?: unknown;
    code?: unknown;
    scope?: unknown;
  };

  if (typeof code !== "string") {
    return NextResponse.json({ error: "code must be a string" }, { status: 400 });
  }

  const bundle =
    scope === "all" ||
    scope === "bundle" ||
    (typeof componentName !== "string" || !String(componentName).trim());

  try {
    const components = await loadComponents();

    if (bundle) {
      const result = runComplianceBundle(code, components);
      if (result.items.length === 0) {
        return NextResponse.json({
          mode: "bundle" as const,
          overall: "FAIL" as const,
          components: result.components,
          items: result.items,
          totalPassed: result.totalPassed,
          totalChecks: result.totalChecks,
          message: "No Kyra components found in code (expected tags like <Button>, <Input>, …).",
        });
      }
      return NextResponse.json({ mode: "bundle", ...result });
    }

    const name = String(componentName).trim();
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

    const result = runComplianceScorecard(name, code, spec);
    return NextResponse.json({ mode: "single", ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to run scorecard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
