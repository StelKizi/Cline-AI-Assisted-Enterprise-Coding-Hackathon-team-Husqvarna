import { escapeHtml } from "./preview-html";

const KYRA = new Set([
  "Button",
  "Input",
  "Card",
  "Badge",
  "Alert",
  "Link",
  "Text",
  "Heading",
  "Select",
  "Checkbox",
]);

const HTML_PASS = new Set([
  "main",
  "section",
  "article",
  "div",
  "nav",
  "header",
  "footer",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "code",
  "pre",
  "br",
  "hr",
]);

const VOID_HTML = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

type Ctx = { title: string };

function stripJsxNoise(s: string): string {
  return s.replace(/{\/\*[\s\S]*?\*\/}/g, "").replace(/\/\/[^\n]*/g, "");
}

function extractPlain(inner: string): string {
  const t = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t;
}

function parseAttrs(attrRegion: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z][\w]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrRegion)) !== null) {
    out[m[1]] = m[2] ?? m[3] ?? "";
  }
  return out;
}

function reLit(tag: string): string {
  return tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseOpenTag(source: string, pos: number): {
  name: string;
  attrs: Record<string, string>;
  selfClosing: boolean;
  end: number;
} | null {
  if (source[pos] !== "<") return null;
  if (source[pos + 1] === "/" || source[pos + 1] === "!" || source[pos + 1] === "?") return null;
  if (source.slice(pos, pos + 2) === "<>") {
    return { name: "Fragment", attrs: {}, selfClosing: false, end: pos + 2 };
  }
  let i = pos + 1;
  let name = "";
  while (i < source.length && /[A-Za-z0-9]/.test(source[i])) {
    name += source[i];
    i++;
  }
  if (!name) return null;
  const attrStart = i;
  while (i < source.length && source[i] !== ">") i++;
  if (i >= source.length) return null;
  const gt = i;
  const chunk = source.slice(pos, gt + 1);
  const attrs = parseAttrs(source.slice(attrStart, gt).trim());
  const selfClosing = /\/\s*>$/.test(chunk) || VOID_HTML.has(name.toLowerCase());
  return { name, attrs, selfClosing, end: gt + 1 };
}

function findMatchingClose(source: string, contentStart: number, tag: string): number {
  const n = source.length;
  if (tag === "Fragment") {
    const j = source.indexOf("</>", contentStart);
    return j === -1 ? n : j;
  }
  const tl = tag.toLowerCase();
  let depth = 1;
  let i = contentStart;
  while (i < n && depth > 0) {
    const lt = source.indexOf("<", i);
    if (lt === -1) return n;
    if (source[lt + 1] === "/") {
      const m = /^<\/\s*([a-zA-Z0-9]+)\s*>/.exec(source.slice(lt));
      if (m && m[1].toLowerCase() === tl) {
        depth--;
        if (depth === 0) return lt;
        i = lt + m[0].length;
        continue;
      }
      i = lt + 1;
      continue;
    }
    const om = /^<\s*([a-zA-Z][a-zA-Z0-9]*)\b/.exec(source.slice(lt));
    if (!om) {
      i = lt + 1;
      continue;
    }
    const nm = om[1];
    const gt = source.indexOf(">", lt);
    if (gt === -1) return n;
    const chunk = source.slice(lt, gt + 1);
    const selfClosing = /\/\s*>$/.test(chunk);
    const voidEl = VOID_HTML.has(nm.toLowerCase());
    i = gt + 1;
    if (selfClosing || voidEl) continue;
    if (nm.toLowerCase() === tl) depth++;
  }
  return n;
}

function unwrapFragments(s: string): string {
  let t = s.trim();
  for (let guard = 0; guard < 20; guard++) {
    if (t.startsWith("<>") && t.endsWith("</>")) {
      t = t.slice(2, -3).trim();
      continue;
    }
    break;
  }
  return t;
}

function extractMainInner(s: string): string {
  const t = s.trim();
  const m = /^<\s*main\b[^>]*>/i.exec(t);
  if (m && m.index === 0) {
    const openEnd = m[0].length;
    const close = findMatchingClose(t, openEnd, "main");
    return t.slice(openEnd, close).trim();
  }
  return t;
}

function btnSizeClass(size: string): string {
  if (size === "sm") return " btn-sm";
  if (size === "lg") return " btn-lg";
  if (size === "xl") return " btn-xl";
  return "";
}

function htmlFromKyra(name: string, attrs: Record<string, string>, inner: string, ctx: Ctx): string {
  const variant = attrs.variant ?? "primary";
  const size = attrs.size ?? "md";
  const label = extractPlain(inner) || ctx.title;

  switch (name) {
    case "Button": {
      let cls = "btn btn-primary";
      if (variant === "secondary") cls = "btn btn-secondary";
      else if (variant === "ghost") cls = "btn btn-ghost";
      else if (variant === "danger") cls = "btn btn-danger";
      else if (variant === "link") cls = "btn btn-link";
      return `<div class="surface preview-ai-block"><button type="button" class="${cls}${btnSizeClass(size)}">${escapeHtml(label)}</button></div>`;
    }
    case "Input": {
      let extra = "";
      if (variant === "error") extra = " input-error";
      else if (variant === "success") extra = " input-success";
      else if (variant === "warning") extra = " input-warning";
      else if (variant === "disabled") extra = " input-disabled";
      const ph = attrs.placeholder ?? "…";
      const dis = variant === "disabled" ? " disabled" : "";
      return `<div class="surface preview-ai-block"><input class="input${extra}" placeholder="${escapeHtml(ph)}"${dis} /></div>`;
    }
    case "Card": {
      let cardCls = "card card-elevated";
      if (variant === "outlined") cardCls = "card card-outlined";
      else if (variant === "filled") cardCls = "card card-filled";
      else if (variant === "flat") cardCls = "card card-flat";
      const innerHtml = convertMixed(inner, ctx);
      return `<div class="surface preview-ai-block"><div class="${cardCls}">${innerHtml}</div></div>`;
    }
    case "Badge": {
      let b = "badge badge-neutral";
      if (variant === "brand") b = "badge badge-brand";
      else if (variant === "success") b = "badge badge-success";
      else if (variant === "warning") b = "badge badge-warning";
      else if (variant === "error") b = "badge badge-error";
      return `<div class="surface preview-ai-block"><span class="${b}">${escapeHtml(label || "New")}</span></div>`;
    }
    case "Alert": {
      const sm = size === "sm" ? " alert-sm" : "";
      let a = `alert alert-info${sm}`;
      if (variant === "success") a = `alert alert-success${sm}`;
      else if (variant === "warning") a = `alert alert-warning${sm}`;
      else if (variant === "error") a = `alert alert-error${sm}`;
      const title = attrs.title ?? "Notice";
      const body = extractPlain(inner) || ctx.title;
      return `<div class="surface preview-ai-block"><div class="${a}"><div class="alert-title">${escapeHtml(title)}</div>${escapeHtml(body)}</div></div>`;
    }
    case "Link": {
      let l = "link link-md link-primary";
      if (variant === "secondary") l = "link link-md link-secondary";
      else if (variant === "muted") l = "link link-md link-muted";
      else if (variant === "danger") l = "link link-md link-danger";
      if (size === "sm") l = l.replace("link-md", "link-sm");
      if (size === "lg") l = l.replace("link-md", "link-lg");
      const href = attrs.href ?? "#";
      return `<div class="surface preview-ai-block"><a class="${l}" href="${escapeHtml(href)}">${escapeHtml(label || "Link")}</a></div>`;
    }
    case "Text": {
      let t = "text-body";
      if (variant === "caption") t = "text-caption";
      else if (variant === "label") t = "text-label";
      else if (variant === "muted") t = "text-muted";
      return `<div class="surface preview-ai-block"><p class="${t}">${escapeHtml(label)}</p></div>`;
    }
    case "Heading": {
      let h = "hd-h1";
      if (variant === "display") h = "hd-display";
      else if (variant === "h2") h = "hd-h2";
      else if (variant === "h3") h = "hd-h3";
      return `<div class="surface preview-ai-block"><div class="${h}">${escapeHtml(label)}</div></div>`;
    }
    case "Select": {
      let sel = "select";
      if (variant === "error") sel += " select-error";
      if (variant === "success") sel += " select-success";
      return `<div class="surface preview-ai-block"><div class="select-wrap"><select class="${sel}"><option>One</option><option>Two</option></select></div></div>`;
    }
    case "Checkbox": {
      const err = variant === "error" ? " cb-error" : "";
      const lab = attrs.label ?? label ?? "Checkbox";
      return `<div class="surface preview-ai-block"><label class="cb${err}"><input type="checkbox" /> <span>${escapeHtml(lab)}</span></label></div>`;
    }
    default:
      return `<div class="surface preview-ai-block"><p class="muted">Unsupported in preview: ${escapeHtml(name)}</p></div>`;
  }
}

function convertMixed(source: string, ctx: Ctx): string {
  let i = 0;
  const out: string[] = [];
  const n = source.length;
  while (i < n) {
    const lt = source.indexOf("<", i);
    if (lt === -1) {
      out.push(escapeHtml(source.slice(i)));
      break;
    }
    if (lt > i) {
      const raw = source.slice(i, lt);
      if (raw.trim()) out.push(escapeHtml(raw));
    }
    if (source[lt + 1] === "/") {
      const gt = source.indexOf(">", lt);
      i = gt === -1 ? n : gt + 1;
      continue;
    }
    if (source.slice(lt, lt + 4) === "<!--") {
      const end = source.indexOf("-->", lt);
      i = end === -1 ? n : end + 3;
      continue;
    }
    const open = parseOpenTag(source, lt);
    if (!open) {
      out.push(escapeHtml(source[lt]));
      i = lt + 1;
      continue;
    }
    const { name, attrs, selfClosing, end } = open;
    if (name === "Fragment") {
      const close = findMatchingClose(source, end, "Fragment");
      const inner = source.slice(end, close);
      out.push(convertMixed(inner, ctx));
      i = close + 3;
      continue;
    }
    if (KYRA.has(name)) {
      if (selfClosing) {
        out.push(htmlFromKyra(name, attrs, "", ctx));
        i = end;
        continue;
      }
      const closePos = findMatchingClose(source, end, name);
      const inner = source.slice(end, closePos);
      const closeTag = `</${name}>`;
      const closeLen = source.slice(closePos).match(/^<\/\s*[a-zA-Z0-9]+\s*>/)?.[0].length ?? closeTag.length;
      out.push(htmlFromKyra(name, attrs, inner, ctx));
      i = closePos + closeLen;
      continue;
    }
    const lower = name.toLowerCase();
    if (HTML_PASS.has(lower)) {
      if (selfClosing || VOID_HTML.has(lower)) {
        out.push(lower === "br" || lower === "hr" ? `<${lower}>` : `<${name} />`);
        i = end;
        continue;
      }
      const closePos = findMatchingClose(source, end, name);
      const inner = source.slice(end, closePos);
      const closeLen = source.slice(closePos).match(/^<\/\s*[a-zA-Z0-9]+\s*>/)?.[0].length ?? `</${name}>`.length;
      out.push(`<${name}>${convertMixed(inner, ctx)}</${name}>`);
      i = closePos + closeLen;
      continue;
    }
    if (selfClosing || VOID_HTML.has(lower)) {
      i = end;
      continue;
    }
    const closePos = findMatchingClose(source, end, name);
    if (closePos >= n) {
      i = end;
      continue;
    }
    const inner = source.slice(end, closePos);
    const closeLen = source.slice(closePos).match(/^<\/\s*[a-zA-Z0-9]+\s*>/)?.[0].length ?? 1;
    out.push(convertMixed(inner, ctx));
    i = closePos + closeLen;
  }
  return out.join("");
}

/**
 * Best-effort static HTML for iframe preview from OpenAI-style Kyra JSX (sections + multiple components).
 * Returns null if nothing renderable was found.
 */
export function buildPreviewInnerFromKyraJsx(jsx: string, fallbackTitle: string): string | null {
  const cleaned = stripJsxNoise(jsx);
  const root = extractMainInner(unwrapFragments(cleaned));
  const html = convertMixed(root, { title: fallbackTitle });
  return html.trim() ? html : null;
}
