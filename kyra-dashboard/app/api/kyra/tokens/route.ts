import { NextResponse } from "next/server";
import { loadTokens } from "@/lib/kyra/data";

export async function GET() {
  try {
    const tokens = await loadTokens();
    return NextResponse.json(tokens);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load tokens";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
