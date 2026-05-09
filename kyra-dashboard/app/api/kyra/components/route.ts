import { NextResponse } from "next/server";
import { loadComponents } from "@/lib/kyra/data";

/** Mirrors MCP `list_components`: structured list for the dashboard and clients. */
export async function GET() {
  try {
    const components = await loadComponents();
    const list = Object.entries(components).map(([name, spec]) => ({
      name,
      description: spec.description,
    }));
    const markdown = Object.entries(components)
      .map(([name, spec]) => `- ${name}: ${spec.description}`)
      .join("\n");
    return NextResponse.json({ list, markdown });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load components";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
