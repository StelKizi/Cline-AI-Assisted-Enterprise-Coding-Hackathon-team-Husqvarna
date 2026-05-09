import type { TokensJson } from "./types";

function flattenTokensToCssVars(tokens: TokensJson): string {
  const lines: string[] = [":root {"];

  const color = tokens.color as Record<string, Record<string, string>> | undefined;
  if (color) {
    for (const [group, map] of Object.entries(color)) {
      for (const [name, value] of Object.entries(map)) {
        if (typeof value === "string") {
          lines.push(`  --color-${group}-${name}: ${value};`);
        }
      }
    }
  }

  const spacing = tokens.spacing as Record<string, string> | undefined;
  if (spacing) {
    for (const [name, value] of Object.entries(spacing)) {
      if (typeof value === "string") lines.push(`  --space-${name}: ${value};`);
    }
  }

  const radius = tokens.borderRadius as Record<string, string> | undefined;
  if (radius) {
    for (const [name, value] of Object.entries(radius)) {
      if (typeof value === "string") lines.push(`  --radius-${name}: ${value};`);
    }
  }

  const shadow = tokens.shadow as Record<string, string> | undefined;
  if (shadow) {
    for (const [name, value] of Object.entries(shadow)) {
      if (typeof value === "string") lines.push(`  --shadow-${name}: ${value};`);
    }
  }

  const motion = tokens.motion as Record<string, string> | undefined;
  if (motion) {
    for (const [name, value] of Object.entries(motion)) {
      if (typeof value === "string") lines.push(`  --motion-${name}: ${value};`);
    }
  }

  const zIndex = tokens.zIndex as Record<string, string> | undefined;
  if (zIndex) {
    for (const [name, value] of Object.entries(zIndex)) {
      if (typeof value === "string") lines.push(`  --z-${name}: ${value};`);
    }
  }

  const layout = tokens.layout as Record<string, string> | undefined;
  if (layout) {
    for (const [name, value] of Object.entries(layout)) {
      if (typeof value === "string") lines.push(`  --layout-${name}: ${value};`);
    }
  }

  const typo = tokens.typography as
    | {
        fontFamily?: Record<string, string>;
        fontSize?: Record<string, string>;
        fontWeight?: Record<string, number>;
        lineHeight?: Record<string, string>;
        letterSpacing?: Record<string, string>;
      }
    | undefined;
  if (typo?.fontFamily) {
    for (const [name, value] of Object.entries(typo.fontFamily)) {
      if (typeof value === "string") lines.push(`  --font-family-${name}: ${value};`);
    }
  }
  if (typo?.fontSize) {
    for (const [name, value] of Object.entries(typo.fontSize)) {
      if (typeof value === "string") lines.push(`  --font-size-${name}: ${value};`);
    }
  }
  if (typo?.fontWeight) {
    for (const [name, value] of Object.entries(typo.fontWeight)) {
      lines.push(`  --font-weight-${name}: ${value};`);
    }
  }
  if (typo?.lineHeight) {
    for (const [name, value] of Object.entries(typo.lineHeight)) {
      if (typeof value === "string") lines.push(`  --line-height-${name}: ${value};`);
    }
  }
  if (typo?.letterSpacing) {
    for (const [name, value] of Object.entries(typo.letterSpacing)) {
      if (typeof value === "string") lines.push(`  --letter-spacing-${name}: ${value};`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

export function buildPreviewDocument(tokens: TokensJson, bodyInnerHtml: string): string {
  const vars = flattenTokensToCssVars(tokens);
  const css = `
${vars}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-base, system-ui, -apple-system, Segoe UI, Roboto, sans-serif);
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
  font-size: var(--font-size-md, 16px);
  line-height: var(--line-height-normal, 1.5);
}
.page-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
  width: 100%;
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md, 16px);
  padding: var(--space-md, 16px) var(--space-lg, 24px);
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(32, 33, 36, 0.08));
}
.preview-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}
.preview-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md, 8px);
  background: var(--color-neutral-900);
  color: var(--color-neutral-0);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-bold, 700);
}
.preview-mark-label {
  font-weight: var(--font-weight-semibold, 600);
  font-size: var(--font-size-md, 16px);
  color: var(--color-neutral-900);
}
.preview-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md, 16px);
  align-items: center;
}
.preview-main-flow {
  flex: 1;
  width: 100%;
  max-width: var(--layout-contentMaxWidth, 720px);
  margin: 0 auto;
  padding: var(--space-lg, 24px);
}
.preview-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md, 16px);
  padding: var(--space-md, 16px) var(--space-lg, 24px);
  margin-top: auto;
  background: var(--color-neutral-0);
  border-top: 1px solid var(--color-neutral-200);
}
.preview-footer-note { margin: 0; }
.preview-main-flow > h1:first-child {
  margin-top: 0;
}
h1 {
  font-size: var(--font-size-2xl, 32px);
  font-weight: var(--font-weight-bold, 700);
  margin: 0 0 var(--space-md, 16px);
  line-height: var(--line-height-tight, 1.2);
}
.surface {
  background: var(--color-neutral-0);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-lg, 24px);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(32, 33, 36, 0.1));
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm, 8px);
  padding: 10px 18px;
  border-radius: var(--radius-md, 8px);
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium, 500);
  font-size: var(--font-size-md, 16px);
}
.btn-sm { padding: 6px 12px; font-size: var(--font-size-sm, 14px); }
.btn-lg { padding: 12px 22px; font-size: var(--font-size-lg, 20px); }
.btn-xl { padding: 14px 28px; font-size: var(--font-size-xl, 24px); }
.btn-primary { background: var(--color-brand-primary); color: var(--color-brand-onPrimary, #fff); }
.btn-secondary { background: var(--color-neutral-200); color: var(--color-neutral-900); }
.btn-ghost { background: transparent; color: var(--color-brand-primary); border: 1px solid var(--color-neutral-300); }
.btn-danger { background: var(--color-semantic-error); color: var(--color-neutral-0); }
.btn-link { background: transparent; color: var(--color-brand-primary); text-decoration: underline; padding: 0; font-size: inherit; }
.input {
  width: 100%;
  max-width: 420px;
  padding: 10px 12px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-neutral-300);
  background: var(--color-neutral-0);
  color: var(--color-neutral-900);
  font-size: var(--font-size-md, 16px);
}
.input-error { border-color: var(--color-semantic-error); }
.input-success { border-color: var(--color-semantic-success); }
.input-warning { border-color: var(--color-semantic-warning); }
.input-disabled { opacity: 0.55; pointer-events: none; }
.card {
  border-radius: var(--radius-md, 8px);
  padding: var(--space-md, 16px);
}
.card-elevated {
  background: var(--color-neutral-0);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(32, 33, 36, 0.12));
}
.card-outlined {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
}
.card-filled { background: var(--color-neutral-100); }
.card-flat { background: var(--color-neutral-50, #fafafa); border: 1px solid var(--color-border-subtle, var(--color-neutral-200)); box-shadow: none; }
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full, 9999px);
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
}
.badge-neutral { background: var(--color-neutral-200); color: var(--color-neutral-900); }
.badge-brand { background: var(--color-brand-primary); color: var(--color-brand-onPrimary, #fff); }
.badge-success { background: var(--color-semantic-successMuted); color: var(--color-semantic-success); }
.badge-warning { background: var(--color-semantic-warningMuted); color: var(--color-neutral-900); }
.badge-error { background: var(--color-semantic-errorMuted); color: var(--color-semantic-error); }
.alert {
  border-radius: var(--radius-md, 8px);
  padding: var(--space-md, 16px);
  border: 1px solid transparent;
}
.alert-sm { padding: var(--space-sm, 8px); font-size: var(--font-size-sm, 14px); }
.alert-info { background: var(--color-semantic-infoMuted); border-color: var(--color-semantic-info); color: var(--color-neutral-900); }
.alert-success { background: var(--color-semantic-successMuted); border-color: var(--color-semantic-success); color: var(--color-neutral-900); }
.alert-warning { background: var(--color-semantic-warningMuted); border-color: var(--color-semantic-warning); color: var(--color-neutral-900); }
.alert-error { background: var(--color-semantic-errorMuted); border-color: var(--color-semantic-error); color: var(--color-neutral-900); }
.alert-title { font-weight: var(--font-weight-semibold, 600); margin-bottom: var(--space-xs, 4px); }
.link { text-decoration: underline; cursor: pointer; font-weight: var(--font-weight-medium, 500); }
.link-sm { font-size: var(--font-size-sm, 14px); }
.link-md { font-size: var(--font-size-md, 16px); }
.link-lg { font-size: var(--font-size-lg, 20px); }
.link-primary { color: var(--color-brand-primary); }
.link-secondary { color: var(--color-neutral-700); }
.link-muted { color: var(--color-neutral-500); }
.link-danger { color: var(--color-semantic-error); }
.text-body { color: var(--color-neutral-900); line-height: var(--line-height-normal, 1.5); }
.text-caption { color: var(--color-neutral-700); font-size: var(--font-size-sm, 14px); }
.text-label { color: var(--color-neutral-800); font-size: var(--font-size-sm, 14px); font-weight: var(--font-weight-medium, 500); }
.text-muted { color: var(--color-neutral-600); font-size: var(--font-size-md, 16px); }
.hd-display { font-size: var(--font-size-4xl, 56px); font-weight: var(--font-weight-bold, 700); line-height: var(--line-height-tight, 1.2); margin: 0 0 var(--space-md, 16px); }
.hd-h1 { font-size: var(--font-size-3xl, 40px); font-weight: var(--font-weight-bold, 700); line-height: var(--line-height-snug, 1.35); margin: 0 0 var(--space-sm, 8px); }
.hd-h2 { font-size: var(--font-size-2xl, 32px); font-weight: var(--font-weight-semibold, 600); margin: 0 0 var(--space-sm, 8px); }
.hd-h3 { font-size: var(--font-size-xl, 24px); font-weight: var(--font-weight-semibold, 600); margin: 0 0 var(--space-xs, 4px); }
.select-wrap { max-width: 420px; }
.select {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-neutral-300);
  background: var(--color-neutral-0);
  font-size: var(--font-size-md, 16px);
}
.select-error { border-color: var(--color-semantic-error); }
.select-success { border-color: var(--color-semantic-success); }
.cb { display: flex; align-items: flex-start; gap: var(--space-sm, 8px); max-width: 420px; }
.cb input { margin-top: 4px; }
.cb-error label { color: var(--color-semantic-error); }
.muted { color: var(--color-neutral-700); font-size: var(--font-size-sm, 14px); margin-top: var(--space-md, 16px); }
.signup-hero { margin-top: var(--space-md, 16px); }
.signup-h2 { margin-top: 0; }
.signup-lead { margin: var(--space-sm, 8px) 0 var(--space-md, 16px); }
.signup-field { margin-bottom: var(--space-sm, 8px); max-width: 100%; }
.signup-cb { margin-bottom: var(--space-md, 16px); }
.signup-actions { display: flex; flex-wrap: wrap; gap: var(--space-md, 16px); align-items: center; }
.signup-card-title { margin-top: 0; }
.landing-badge-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  margin-bottom: var(--space-md, 16px);
  flex-wrap: wrap;
}
.landing-lead {
  margin: 0 0 var(--space-lg, 24px);
  max-width: 52ch;
}
.landing-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md, 16px);
  align-items: center;
  margin-top: var(--space-lg, 24px);
}
.landing-input-row {
  margin-top: var(--space-lg, 24px);
  max-width: 420px;
}
.landing-input-row .text-label {
  display: block;
  margin-bottom: var(--space-xs, 4px);
}
.landing-features {
  display: grid;
  gap: var(--space-md, 16px);
  margin-top: var(--space-xl, 32px);
}
@media (min-width: 720px) {
  .landing-features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.landing-footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md, 16px);
  align-items: center;
  margin-top: var(--space-xl, 32px);
}
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kyra preview</title>
  <style>${css}</style>
</head>
<body>
${bodyInnerHtml}
</body>
</html>`;
}

/** Full-page chrome: header + main + footer (preview HTML only). */
export function wrapPageShell(mainInnerHtml: string): string {
  return (
    `<div class="page-shell">` +
    `<header class="preview-header" role="banner">` +
    `<div class="preview-header-left">` +
    `<span class="preview-mark" aria-hidden="true">K</span>` +
    `<span class="preview-mark-label">Kyra</span>` +
    `</div>` +
    `<nav class="preview-nav" aria-label="Preview navigation">` +
    `<a class="link link-sm link-secondary" href="#">Docs</a>` +
    `<a class="link link-sm link-muted" href="#">Support</a>` +
    `</nav>` +
    `</header>` +
    `<main class="preview-main-flow">` +
    mainInnerHtml +
    `</main>` +
    `<footer class="preview-footer" role="contentinfo">` +
    `<p class="text-caption preview-footer-note">Kyra · design tokens preview</p>` +
    `<a class="link link-sm link-muted" href="#">Privacy</a>` +
    `</footer>` +
    `</div>`
  );
}

function btnSizeClass(size: string): string {
  if (size === "sm") return " btn-sm";
  if (size === "lg") return " btn-lg";
  if (size === "xl") return " btn-xl";
  return "";
}

/** Map Kyra component + variant to static HTML that mirrors token-driven styling (preview only). */
export function buildStubPreviewBody(params: {
  title: string;
  componentName: string;
  wantsPage: boolean;
  variant: string;
  size: string;
  /** Multi-block demo when the prompt looks like a signup / hero form (stub only). */
  layout?: "signup";
  /** Short headline for <h1> when layout is signup. */
  pageTitle?: string;
}): string {
  const { title, componentName, wantsPage, variant, size, layout, pageTitle } = params;
  const h1 = escapeHtml(pageTitle ?? title);

  if (wantsPage && layout === "signup") {
    const note = `<p class="muted">Demo preview · <strong>signup layout</strong> · focus <strong>${escapeHtml(componentName)}</strong> · CTA variant <strong>${escapeHtml(variant)}</strong> · size <strong>${escapeHtml(size)}</strong></p>`;
    let btnCls = "btn btn-primary";
    if (variant === "secondary") btnCls = "btn btn-secondary";
    else if (variant === "ghost") btnCls = "btn btn-ghost";
    else if (variant === "danger") btnCls = "btn btn-danger";
    else if (variant === "link") btnCls = "btn btn-link";
    const actions =
      componentName === "Card"
        ? `<div class="card card-elevated signup-hero">
            ${note}
            <div class="hd-h3 signup-card-title">${h1}</div>
            <p class="text-muted signup-lead">We never put hex colors in JSX—only token names like <code>color.brand.primary</code>.</p>
            <input class="input signup-field" placeholder="Email address" />
            <label class="cb signup-cb"><input type="checkbox" /> <span>I agree to the terms</span></label>
            <button type="button" class="${btnCls}${btnSizeClass(size)}">Create account</button>
          </div>`
        : `<div class="surface signup-hero">
            ${note}
            <div class="hd-h2 signup-h2">Get started</div>
            <p class="text-muted signup-lead">Use only Kyra tokens for color intent—no hex or rgb in components.</p>
            <input class="input signup-field" placeholder="Email address" />
            <label class="cb signup-cb"><input type="checkbox" /> <span>I agree to the terms and privacy policy</span></label>
            <div class="signup-actions">
              <button type="button" class="${btnCls}${btnSizeClass(size)}">Create account</button>
              <a class="link link-sm link-secondary" href="#">Sign in</a>
            </div>
          </div>`;
    return wrapPageShell(`<h1>${h1}</h1>${actions}`);
  }

  const sizeNote = `<p class="muted">Demo preview · component <strong>${escapeHtml(componentName)}</strong> · variant <strong>${escapeHtml(variant)}</strong> · size <strong>${escapeHtml(size)}</strong></p>`;

  let core = "";
  if (componentName === "Button") {
    let cls = "btn btn-primary";
    if (variant === "secondary") cls = "btn btn-secondary";
    else if (variant === "ghost") cls = "btn btn-ghost";
    else if (variant === "danger") cls = "btn btn-danger";
    else if (variant === "link") cls = "btn btn-link";
    core = `<div class="surface">${sizeNote}<button type="button" class="${cls}${btnSizeClass(size)}">Action</button></div>`;
  } else if (componentName === "Input") {
    let extra = "";
    if (variant === "error") extra = " input-error";
    else if (variant === "success") extra = " input-success";
    else if (variant === "warning") extra = " input-warning";
    else if (variant === "disabled") extra = " input-disabled";
    core = `<div class="surface">${sizeNote}<input class="input${extra}" placeholder="Email" ${variant === "disabled" ? "disabled" : ""} /></div>`;
  } else if (componentName === "Card") {
    let cardCls = "card card-elevated";
    if (variant === "outlined") cardCls = "card card-outlined";
    else if (variant === "filled") cardCls = "card card-filled";
    else if (variant === "flat") cardCls = "card card-flat";
    core = `<div class="surface">${sizeNote}<div class="${cardCls}"><p>${escapeHtml(title)}</p></div></div>`;
  } else if (componentName === "Badge") {
    let b = "badge badge-neutral";
    if (variant === "brand") b = "badge badge-brand";
    else if (variant === "success") b = "badge badge-success";
    else if (variant === "warning") b = "badge badge-warning";
    else if (variant === "error") b = "badge badge-error";
    core = `<div class="surface">${sizeNote}<span class="${b}">New</span></div>`;
  } else if (componentName === "Alert") {
    const sm = size === "sm" ? " alert-sm" : "";
    let a = `alert alert-info${sm}`;
    if (variant === "success") a = `alert alert-success${sm}`;
    else if (variant === "warning") a = `alert alert-warning${sm}`;
    else if (variant === "error") a = `alert alert-error${sm}`;
    core = `<div class="surface">${sizeNote}<div class="${a}"><div class="alert-title">Notice</div>${escapeHtml(title)}</div></div>`;
  } else if (componentName === "Link") {
    let l = "link link-md link-primary";
    if (variant === "secondary") l = "link link-md link-secondary";
    else if (variant === "muted") l = "link link-md link-muted";
    else if (variant === "danger") l = "link link-md link-danger";
    if (size === "sm") l = l.replace("link-md", "link-sm");
    if (size === "lg") l = l.replace("link-md", "link-lg");
    core = `<div class="surface">${sizeNote}<a class="${l}" href="#">Learn more</a></div>`;
  } else if (componentName === "Text") {
    let t = "text-body";
    if (variant === "caption") t = "text-caption";
    else if (variant === "label") t = "text-label";
    else if (variant === "muted") t = "text-muted";
    core = `<div class="surface">${sizeNote}<p class="${t}">${escapeHtml(title)}</p></div>`;
  } else if (componentName === "Heading") {
    let h = "hd-h1";
    if (variant === "display") h = "hd-display";
    else if (variant === "h2") h = "hd-h2";
    else if (variant === "h3") h = "hd-h3";
    core = `<div class="surface">${sizeNote}<div class="${h}">${escapeHtml(title)}</div></div>`;
  } else if (componentName === "Select") {
    let s = "select";
    if (variant === "error") s += " select-error";
    if (variant === "success") s += " select-success";
    core = `<div class="surface">${sizeNote}<div class="select-wrap"><select class="${s}"><option>One</option><option>Two</option></select></div></div>`;
  } else if (componentName === "Checkbox") {
    const err = variant === "error" ? " cb-error" : "";
    core = `<div class="surface">${sizeNote}<label class="cb${err}"><input type="checkbox" /> <span>I agree to the terms</span></label></div>`;
  } else {
    core = `<div class="surface">${sizeNote}<p class="muted">Unsupported component in preview mapper.</p></div>`;
  }

  if (wantsPage) {
    return wrapPageShell(`<h1>${h1}</h1>${core}`);
  }
  return `<main>${core}</main>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
