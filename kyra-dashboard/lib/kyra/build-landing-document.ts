import { loadTokens } from "./data";
import { buildPreviewDocument, wrapPageShell } from "./preview-html";

/**
 * Static marketing landing built from Kyra design-system contracts.
 * Variants map to preview HTML classes (token CSS variables only — no inline hex/rgb).
 *
 * Contracts aligned with Kyra MCP: `list_components`, `get_tokens`, and
 * `get_component_spec` for Heading, Card, Button, Text, Badge, Link.
 */
export async function buildKyraLandingDocument(): Promise<string> {
  const tokens = await loadTokens();

  const main = `
<h1 class="hd-display" id="landing-title">Ship UI that passes compliance</h1>
<div class="landing-badge-row" aria-label="Product badges">
  <span class="badge badge-brand">Beta</span>
  <span class="badge badge-neutral">Kyra MCP</span>
</div>
<p class="text-body landing-lead">
  Compose experiences with design tokens only—no raw hex or rgb in generated JSX.
  This preview uses the same CSS variables as the scorecard pipeline.
</p>
<div class="landing-features">
  <div class="card card-elevated">
    <div class="hd-h3">Scorecards</div>
    <p class="text-muted">Bundle checks mirror MCP <code>run_compliance_scorecard</code> for every component tag in your snippet.</p>
  </div>
  <div class="card card-outlined">
    <div class="hd-h3">Studio</div>
    <p class="text-muted">Describe a screen in natural language, generate, then revise in place on a stable preview URL.</p>
  </div>
</div>
<div class="landing-actions">
  <button type="button" class="btn btn-primary btn-lg">Start free trial</button>
  <button type="button" class="btn btn-ghost">Watch demo</button>
</div>
<div class="landing-input-row">
  <label class="text-label" for="landing-email">Work email</label>
  <input id="landing-email" class="input" type="email" placeholder="you@company.com" autocomplete="email" />
</div>
<div class="landing-footer-links">
  <a class="link link-sm link-muted" href="/" target="_top">Compliance lab</a>
  <a class="link link-sm link-primary" href="/studio" target="_top">Open studio</a>
</div>
`.trim();

  return buildPreviewDocument(tokens, wrapPageShell(main));
}
