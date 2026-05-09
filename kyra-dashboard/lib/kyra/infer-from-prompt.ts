/** Escape a string for safe use inside a RegExp character class is not enough — escape for literal in RegExp source. */
function reLiteral(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pick a Kyra component from free text. Uses explicit component names plus keyword hints.
 * Only considers names present in `available` (from components.json).
 */
export function inferComponentName(prompt: string, available: string[]): string {
  const h = prompt.toLowerCase();
  const set = new Set(available);
  const score = (name: string, delta: number) => {
    if (!set.has(name)) return;
    scores.set(name, (scores.get(name) ?? 0) + delta);
  };
  const scores = new Map<string, number>();

  for (const name of available) {
    if (new RegExp(`\\b${reLiteral(name)}\\b`, "i").test(prompt)) {
      score(name, 10);
    }
  }

  const phrase = (name: string, p: RegExp, w: number) => {
    if (p.test(h)) score(name, w);
  };

  phrase("Button", /\b(button|cta|clickable|call to action|pressable)\b/, 3);
  phrase("Button", /\b(submit|sign up|signup|register|create account|add to cart|purchase)\b/, 2);
  phrase("Input", /\b(input|text field|textfield|email field|password field|placeholder|textbox)\b/, 4);
  phrase("Input", /\b(type your|enter your|fill in)\b/, 1);
  phrase("Card", /\b(card|panel|surface|tile|elevated box|boxed)\b/, 4);
  phrase("Card", /\b(login box|auth card|form card)\b/, 3);
  phrase("Badge", /\b(badge|pill tag|status pill|label new)\b/, 4);
  phrase("Alert", /\b(alert|banner notice|toast|inline error|warning box)\b/, 4);
  phrase("Link", /\b(nav link|hyperlink|anchor text|href|footer link)\b/, 3);
  if (/\blink\b/.test(h) && /\b(href|anchor|navigation|visit)\b/.test(h)) score("Link", 2);
  phrase("Text", /\b(body copy|paragraph|subtitle|caption text|muted copy|microcopy)\b/, 3);
  phrase("Heading", /\b(headline|hero title|page title|section title|\bh1\b|\bh2\b|\bh3\b)\b/, 4);
  phrase("Heading", /\b(heading)\b/, 2);
  phrase("Select", /\b(select|dropdown|drop-down|pick one|choose option|combobox)\b/, 4);
  phrase("Checkbox", /\b(checkbox|tick box|agree to terms|opt.?in|subscribe toggle)\b/, 4);

  if (/\b(signup|sign\s*up|register|registration|create account)\b/.test(h)) {
    score("Button", 2);
    score("Input", 2);
    score("Card", 2);
  }

  let best = available[0] ?? "Button";
  let bestScore = -1;
  for (const name of available) {
    const s = scores.get(name) ?? 0;
    if (s > bestScore) {
      bestScore = s;
      best = name;
    }
  }
  if (bestScore <= 0 && set.has("Button")) return "Button";
  return best;
}

/**
 * Heuristic full-page vs single-component snippet. Default: full page unless the prompt clearly asks for a fragment.
 */
export function inferWantsPage(prompt: string): boolean {
  const h = prompt.toLowerCase();
  if (
    /\b(only|just)\s+(a|an|the)\s+(button|input|card|badge|alert|link|text|heading|select|checkbox)\b/.test(h)
  ) {
    return false;
  }
  if (
    /\b(single component|one component|component only|snippet only|no page|no layout|no chrome|fragment|minimal jsx|micro[- ]?demo)\b/.test(
      h,
    )
  ) {
    return false;
  }
  if (
    /\b(full page|full-page|landing|entire page|whole page|page layout|marketing page|signup page|registration page|hero|dashboard|wizard|screen)\b/.test(
      h,
    )
  ) {
    return true;
  }
  return true;
}
