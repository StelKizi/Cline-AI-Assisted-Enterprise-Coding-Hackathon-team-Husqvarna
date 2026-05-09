import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { GeneratedRecord } from "./generated-types";

export function getGeneratedDir(): string {
  return path.join(process.cwd(), "data", "generated");
}

function recordPath(slug: string): string {
  return path.join(getGeneratedDir(), `${slug}.json`);
}

export async function ensureGeneratedDir(): Promise<void> {
  await mkdir(getGeneratedDir(), { recursive: true });
}

export async function writeGeneratedRecord(record: GeneratedRecord): Promise<void> {
  await ensureGeneratedDir();
  await writeFile(recordPath(record.slug), JSON.stringify(record, null, 2), "utf-8");
}

export async function readGeneratedRecord(slug: string): Promise<GeneratedRecord | null> {
  try {
    const raw = await readFile(recordPath(slug), "utf-8");
    return JSON.parse(raw) as GeneratedRecord;
  } catch {
    return null;
  }
}
