/** Keep user-provided titles safe for JSX text / HTML text content. */
export function safeDisplayTitle(prompt: string): string {
  const line = prompt.trim().split("\n")[0] ?? "Generated";
  const cleaned = line
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .slice(0, 120);
  if (!cleaned) return "Generated";
  return cleaned;
}

/** Short line for <h1> on full-page stubs — strips color-spec tails and long marketing copy. */
export function shortPageTitle(prompt: string): string {
  let t = prompt.trim().split("\n")[0] ?? "Page";
  const low = t.toLowerCase();
  const colorIdx = low.indexOf("color intent");
  if (colorIdx !== -1) t = t.slice(0, colorIdx).trim();
  t = t.replace(/\s+/g, " ").trim();
  const sent = t.match(/^[^.!?]+[.!?]?/);
  if (sent) t = sent[0].trim();
  if (t.length > 72) t = `${t.slice(0, 69).trim()}…`;
  return t || "Page";
}

/** Heuristic: user asked for a multi-block flow (signup, register, hero form). */
export function wantsSignupLikeLayout(prompt: string): boolean {
  const h = prompt.toLowerCase();
  return /\b(signup|sign\s*up|sign-up|register|registration|create account|account creation|signup flow|sign up flow|full-page signup|hero title)\b/.test(
    h,
  );
}
