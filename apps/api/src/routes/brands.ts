// ─── Brand management routes ────────────────────────────────────────
import { Hono } from "hono";
import { getTokens, getComponents, getApprovedColors, getBannedTerms } from "../engine/brand-state.js";

const HUSQVARNA_ID = "00000000-0000-0000-0000-000000000001";

interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  tokens: Record<string, unknown>;
  components: Record<string, unknown>;
  criticalRequirements: string[];
  policies: Array<{ area: string; rules: string[] }>;
  voice: {
    tone: string[];
    readingLevel: string;
    bannedTerms: Array<{ term: string; reason?: string; alternatives?: string[] }>;
    guidelines: string[];
  };
  assets: Array<{ id: string; name: string; type: string; url?: string }>;
  colors: string[];
}

const brands = new Map<string, Brand>();

function extractPolicies(tokens: Record<string, unknown>, components: Record<string, unknown>) {
  const criticalRequirements: string[] = [];
  const policies: Array<{ area: string; rules: string[] }> = [];

  // From tokens._critical_rules
  if (Array.isArray((tokens as any)._critical_rules)) {
    criticalRequirements.push(...(tokens as any)._critical_rules);
  }

  // From components._critical_requirements
  if (Array.isArray((components as any)._critical_requirements)) {
    for (const r of (components as any)._critical_requirements) {
      if (!criticalRequirements.includes(r)) criticalRequirements.push(r);
    }
  }

  // Extract per-component critical_rules as policies
  for (const [name, spec] of Object.entries(components)) {
    if (name.startsWith("_")) continue;
    const s = spec as Record<string, unknown>;
    if (Array.isArray(s.critical_rules)) {
      policies.push({ area: name, rules: s.critical_rules as string[] });
    }
  }

  // Extract token-level rules (backgrounds, cards, text, etc.)
  const color = (tokens as any).color;
  if (color && typeof color === "object") {
    for (const [section, val] of Object.entries(color as Record<string, unknown>)) {
      const v = val as Record<string, unknown>;
      if (v && typeof v === "object" && typeof v.rule === "string") {
        const existing = policies.find(p => p.area === "Color");
        if (existing) existing.rules.push(`${section}: ${v.rule}`);
        else policies.push({ area: "Color", rules: [`${section}: ${v.rule}`] });
      }
    }
  }

  return { criticalRequirements, policies };
}

function seedHusqvarna() {
  if (brands.has(HUSQVARNA_ID)) return;
  const tokens = getTokens();
  const components = getComponents();
  const colors = Array.from(getApprovedColors());
  const banned = getBannedTerms();
  const { criticalRequirements, policies } = extractPolicies(tokens, components);

  const brand: Brand = {
    id: HUSQVARNA_ID,
    name: "Husqvarna Forest & Garden",
    description: "Brand identity for Husqvarna Forest & Garden web properties.",
    logo: "/assets/husqvarna/logo.webp",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tokens,
    components,
    criticalRequirements,
    policies,
    voice: {
      tone: ["professional", "confident", "clear", "action-oriented"],
      readingLevel: "grade-8",
      bannedTerms: banned,
      guidelines: [
        "Use Active Green (#3A7D00) for all buy-now / add-to-cart buttons",
        "Maximum ONE primary button per decision context",
        "Mobile-first design — design for mobile, then scale up",
        "All elements must align to 4px base unit",
        "Lines longer than 100 characters cause reader fatigue",
      ],
    },
    assets: [
      { id: "a1", name: "Husqvarna Logo (Primary)", type: "logo", url: "/assets/husqvarna/logo.webp" },
      { id: "a2", name: "Husqvarna Chainsaw Product", type: "product-image", url: "/assets/husqvarna/products/550i-xp-chainsaw.webp" },
      { id: "a3", name: "Automower Aspire", type: "product-image", url: "/assets/husqvarna/products/automower-aspire-r6v.webp" },
    ],
    colors,
  };
  brands.set(HUSQVARNA_ID, brand);
}

seedHusqvarna();

export const brandsRoute = new Hono();

brandsRoute.get("/", (c) => {
  const list = Array.from(brands.values()).map(({ tokens, components, ...b }) => b);
  return c.json(list);
});

brandsRoute.get("/:id", (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  const { tokens, components, ...summary } = brand;
  return c.json({
    ...summary,
    tokenCount: Object.keys(tokens).length,
    componentCount: Object.keys(components).length,
  });
});

brandsRoute.get("/:id/tokens", (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  const path = c.req.query("path");
  if (path) {
    let val: unknown = brand.tokens;
    for (const key of path.split(".")) {
      if (val && typeof val === "object") val = (val as Record<string, unknown>)[key];
      else { val = undefined; break; }
    }
    return c.json({ brandId: brand.id, path, value: val ?? null });
  }
  return c.json({ brandId: brand.id, tokens: brand.tokens });
});

brandsRoute.get("/:id/voice", (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  return c.json({ brandId: brand.id, voice: brand.voice });
});

brandsRoute.get("/:id/assets", (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  return c.json({ brandId: brand.id, assets: brand.assets });
});

brandsRoute.get("/:id/colors", (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  return c.json({ brandId: brand.id, colors: brand.colors });
});

brandsRoute.get("/:id/components", (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  return c.json({ brandId: brand.id, components: brand.components });
});

brandsRoute.get("/:id/policies", (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  return c.json({ brandId: brand.id, criticalRequirements: brand.criticalRequirements, policies: brand.policies });
});

brandsRoute.put("/:id", async (c) => {
  const brand = brands.get(c.req.param("id"));
  if (!brand) return c.json({ error: "Brand not found" }, 404);
  const body = await c.req.json();
  if (body.name) brand.name = body.name;
  if (body.description) brand.description = body.description;
  brand.updatedAt = new Date().toISOString();
  return c.json({ success: true, brand: { id: brand.id, name: brand.name, updatedAt: brand.updatedAt } });
});

brandsRoute.post("/", async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const brand: Brand = {
    id,
    name: body.name || "New Brand",
    description: body.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tokens: body.tokens || {},
    components: body.components || {},
    criticalRequirements: body.criticalRequirements || [],
    policies: body.policies || [],
    voice: body.voice || { tone: [], readingLevel: "grade-8", bannedTerms: [], guidelines: [] },
    assets: body.assets || [],
    colors: body.colors || [],
  };
  brands.set(id, brand);
  return c.json({ success: true, id }, 201);
});
