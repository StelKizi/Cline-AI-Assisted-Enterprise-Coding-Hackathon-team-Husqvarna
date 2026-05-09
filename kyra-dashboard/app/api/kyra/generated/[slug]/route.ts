import { NextResponse } from "next/server";
import { readGeneratedRecord } from "@/lib/kyra/generated-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const record = await readGeneratedRecord(slug);
  if (!record) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
