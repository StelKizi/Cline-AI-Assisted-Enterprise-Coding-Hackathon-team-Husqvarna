import type { ComponentSpec } from "./types";
import type { TokensJson } from "./types";
import { buildPreviewDocument, buildStubPreviewBody } from "./preview-html";
import { safeDisplayTitle, shortPageTitle, wantsSignupLikeLayout } from "./safe-text";

type LexMap = Record<string, string[]>;

function getPromptLexicon(tokens: TokensJson): Record<string, unknown> | undefined {
  const pl = tokens.promptLexicon;
  if (pl && typeof pl === "object" && !Array.isArray(pl)) return pl as Record<string, unknown>;
  return undefined;
}

function variantLexForComponent(tokens: TokensJson, componentName: string): LexMap | undefined {
  const root = getPromptLexicon(tokens);
  if (!root) return undefined;
  const raw = root[componentName];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: LexMap = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith("_")) continue;
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[k] = v as string[];
  }
  return Object.keys(out).length ? out : undefined;
}

function sizeLex(tokens: TokensJson): LexMap | undefined {
  const root = getPromptLexicon(tokens);
  if (!root) return undefined;
  const raw = root.sizes;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: LexMap = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[k] = v as string[];
  }
  return Object.keys(out).length ? out : undefined;
}

/** Prefer longest keyword / variant substring match (e.g. "link" vs "primary" in long prompts). */
export function pickVariantForComponent(
  componentName: string,
  spec: ComponentSpec,
  prompt: string,
  tokens: TokensJson,
): string {
  const h = prompt.toLowerCase();
  const lex = variantLexForComponent(tokens, componentName);
  let bestVariant = spec.allowed_variants[0];
  let bestScore = 0;

  for (const v of spec.allowed_variants) {
    let s = 0;
    if (h.includes(v.toLowerCase())) s = Math.max(s, v.length);
    const kws = lex?.[v];
    if (kws) {
      for (const kw of kws) {
        const k = kw.toLowerCase();
        if (k && h.includes(k)) s = Math.max(s, k.length);
      }
    }
    if (s > bestScore) {
      bestScore = s;
      bestVariant = v;
    }
  }

  if (bestScore > 0) return bestVariant;
  const fallback = spec.allowed_variants.find((v) => h.includes(v.toLowerCase()));
  return fallback ?? spec.allowed_variants[0];
}

export function pickSizeForComponent(
  _componentName: string,
  spec: ComponentSpec,
  prompt: string,
  tokens: TokensJson,
): string {
  const h = prompt.toLowerCase();
  const lex = sizeLex(tokens);
  let best = spec.allowed_sizes.includes("md") ? "md" : spec.allowed_sizes[0];
  let bestScore = 0;

  for (const size of spec.allowed_sizes) {
    let s = 0;
    if (h.includes(size.toLowerCase())) s = Math.max(s, size.length);
    const kws = lex?.[size];
    if (kws) {
      for (const kw of kws) {
        const k = kw.toLowerCase();
        if (k && h.includes(k)) s = Math.max(s, k.length);
      }
    }
    if (s > bestScore) {
      bestScore = s;
      best = size;
    }
  }
  if (bestScore > 0) return best;
  return spec.allowed_sizes.includes("md") ? "md" : spec.allowed_sizes[0];
}

export function generateStubPage(params: {
  prompt: string;
  componentName: string;
  wantsPage: boolean;
  spec: ComponentSpec;
  tokens: TokensJson;
}): { jsx: string; previewHtml: string } {
  const title = safeDisplayTitle(params.prompt);
  const pageHeading = shortPageTitle(params.prompt);
  const variant = pickVariantForComponent(params.componentName, params.spec, params.prompt, params.tokens);
  const size = pickSizeForComponent(params.componentName, params.spec, params.prompt, params.tokens);

  const signupLayout =
    params.wantsPage &&
    wantsSignupLikeLayout(params.prompt) &&
    ["Button", "Input", "Card"].includes(params.componentName);

  const heading = params.wantsPage ? `    <h1>${escapeXmlish(pageHeading)}</h1>\n` : "";

  const bodyJsx = signupLayout
    ? buildComposedSignupJsx(params.componentName, variant, size, pageHeading)
    : buildStubJsx(params.componentName, variant, size, title);
  const jsx = params.wantsPage
    ? `${pageChromeOpen()}${heading}${bodyJsx}${pageChromeClose()}`
    : `<>\n  ${bodyJsx}\n</>`;

  const body = buildStubPreviewBody({
    title,
    componentName: params.componentName,
    wantsPage: params.wantsPage,
    variant,
    size,
    ...(params.wantsPage ? { pageTitle: pageHeading } : {}),
    ...(signupLayout ? { layout: "signup" as const } : {}),
  });
  const previewHtml = buildPreviewDocument(params.tokens, body);

  return { jsx, previewHtml };
}

function escapeXmlish(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Full-page chrome for stub JSX (matches preview shell: banner, main, contentinfo). */
function pageChromeOpen(): string {
  return (
    `<>\n` +
    `  <header role="banner">\n` +
    `    <Text variant="label" size="sm">Kyra</Text>\n` +
    `    <nav aria-label="Site">\n` +
    `      <Link variant="muted" size="sm" href="/docs">Docs</Link>\n` +
    `      <Link variant="muted" size="sm" href="#">Help</Link>\n` +
    `    </nav>\n` +
    `  </header>\n` +
    `  <main>\n`
  );
}

function pageChromeClose(): string {
  return (
    `  </main>\n` +
    `  <footer role="contentinfo">\n` +
    `    <Text variant="caption" size="sm">Design system preview</Text>\n` +
    `    <Link variant="muted" size="sm" href="#">Privacy</Link>\n` +
    `  </footer>\n` +
    `</>`
  );
}

/** Multi-block stub for signup-like prompts (still Kyra-only tags; compliance focuses on selected component). */
function buildComposedSignupJsx(focus: string, variant: string, size: string, shortTitle: string): string {
  void shortTitle;
  const lead =
    "Use only Kyra color tokens (e.g. color.brand.primary)—never hex or rgb in JSX.";
  const inputVariant = focus === "Input" ? variant : "default";
  const inputSize = focus === "Input" ? size : "md";
  const stack =
    `  <Heading variant="h2" size="md">Get started</Heading>\n` +
    `  <Text variant="muted" size="sm">${escapeXmlish(lead)}</Text>\n` +
    `  <Input variant="${inputVariant}" size="${inputSize}" placeholder="Email address" />\n` +
    `  <Checkbox variant="default" size="md" label="I agree to the terms and privacy policy" />\n`;

  if (focus === "Card") {
    return (
      `  <Card variant="${variant}" size="lg">\n` +
      `    <Heading variant="h3" size="sm">Get started</Heading>\n` +
      `    <Text variant="muted" size="sm">${escapeXmlish(lead)}</Text>\n` +
      `    <Input variant="default" size="md" placeholder="Email address" />\n` +
      `    <Checkbox variant="default" size="md" label="I agree to the terms and privacy policy" />\n` +
      `    <Button variant="primary" size="md">Create account</Button>\n` +
      `    <Link variant="secondary" size="sm" href="/login">Sign in</Link>\n` +
      `  </Card>`
    );
  }
  if (focus === "Input") {
    return (
      `${stack}` +
      `  <Button variant="primary" size="md">Create account</Button>\n` +
      `  <Link variant="secondary" size="sm" href="/login">Sign in</Link>`
    );
  }
  return (
    `${stack}` +
    `  <Button variant="${variant}" size="${size}">Create account</Button>\n` +
    `  <Link variant="secondary" size="sm" href="/login">Sign in</Link>`
  );
}

function buildStubJsx(componentName: string, variant: string, size: string, title: string): string {
  switch (componentName) {
    case "Button":
      return `<Button variant="${variant}" size="${size}">Submit</Button>`;
    case "Input":
      return `<Input variant="${variant}" size="${size}" placeholder="Email" />`;
    case "Card":
      return `<Card variant="${variant}" size="${size}">\n    <p>${title}</p>\n  </Card>`;
    case "Badge":
      return `<Badge variant="${variant}" size="${size}">New</Badge>`;
    case "Alert":
      return `<Alert variant="${variant}" size="${size}" title="Notice">\n    ${title}\n  </Alert>`;
    case "Link":
      return `<Link variant="${variant}" size="${size}" href="/docs">Learn more</Link>`;
    case "Text":
      return `<Text variant="${variant}" size="${size}">${title}</Text>`;
    case "Heading":
      return `<Heading variant="${variant}" size="${size}">${title}</Heading>`;
    case "Select":
      return `<Select variant="${variant}" size="${size}" placeholder="Choose">\n    <option>One</option>\n    <option>Two</option>\n  </Select>`;
    case "Checkbox":
      return `<Checkbox variant="${variant}" size="${size}" label="I agree to the terms" />`;
    default:
      return `<Button variant="primary" size="md">Submit</Button>`;
  }
}
