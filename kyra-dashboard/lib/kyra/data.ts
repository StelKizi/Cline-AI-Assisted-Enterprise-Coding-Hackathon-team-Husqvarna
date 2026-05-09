import { readFile } from "fs/promises";
import path from "path";
import { getDesignSystemDir } from "./paths";
import type { ComponentsJson, TokensJson } from "./types";

export async function loadTokens(): Promise<TokensJson> {
  const p = path.join(getDesignSystemDir(), "tokens.json");
  const raw = await readFile(p, "utf-8");
  return JSON.parse(raw) as TokensJson;
}

export async function loadComponents(): Promise<ComponentsJson> {
  const p = path.join(getDesignSystemDir(), "components.json");
  const raw = await readFile(p, "utf-8");
  return JSON.parse(raw) as ComponentsJson;
}
