import { Hono } from "hono";
import { getTokens, getBannedTerms } from "../engine/brand-state.js";

export const brandsRoute = new Hono();

const MOCK_BRANDS: Record<string, any> = {
  "acme": {
    id: "acme-brand-1001",
    organizationId: "org-acme-99",
    name: "Acme Corporation",
    slug: "acme",
    description: "Acme Corp Brand Guidelines and Design System Spec",
    plan: "professional",
    apiCallsThisMonth: 3410,
    apiCallsLimit: 50000,
    status: "active",
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  "husqvarna": {
    id: "d3b07384-d113-4ec5-a5d7-e0e6355e005c",
    organizationId: "b02008fb-b8cc-4d3f-b883-7c87c71e21b2",
    name: "Husqvarna Forest & Garden",
    slug: "husqvarna",
    description: "Husqvarna Forest & Garden Web Design Specification and Brand Guidelines",
    plan: "enterprise",
    apiCallsThisMonth: 14520,
    apiCallsLimit: 100000,
    status: "active",
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  }
};

function resolveBrand(idOrSlug: string) {
  if (idOrSlug === "current" || !idOrSlug) {
    return MOCK_BRANDS["acme"];
  }
  for (const b of Object.values(MOCK_BRANDS)) {
    if (b.id === idOrSlug || b.slug === idOrSlug.toLowerCase()) {
      return b;
    }
  }
  // Dynamic brand fallback for custom brands
  return {
    id: idOrSlug,
    organizationId: "custom-org",
    name: `Brand (${idOrSlug})`,
    slug: idOrSlug.toLowerCase(),
    description: "Custom inputted brand specification",
    plan: "starter",
    apiCallsThisMonth: 0,
    apiCallsLimit: 10000,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// GET /brands - List brands
brandsRoute.get("/", async (c) => {
  return c.json(Object.values(MOCK_BRANDS));
});

// GET /brands/:id — get brand state summary
brandsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const brand = resolveBrand(id);
  return c.json(brand);
});

// GET /brands/:id/tokens — get current token set
brandsRoute.get("/:id/tokens", async (c) => {
  const id = c.req.param("id");
  const brand = resolveBrand(id);
  const rawTokens = getTokens(brand.slug);

  return c.json({
    id: `tokens-${brand.slug}`,
    brandId: brand.id,
    name: "default",
    version: "1.0.0",
    groups: rawTokens,
    publishedAt: new Date().toISOString(),
    publishedBy: `${brand.name} Brand Operations`,
  });
});

// GET /brands/:id/voice — get current voice rules
brandsRoute.get("/:id/voice", async (c) => {
  const id = c.req.param("id");
  const brand = resolveBrand(id);
  const bannedVocabulary = getBannedTerms(brand.slug);

  return c.json({
    id: `voice-${brand.slug}`,
    brandId: brand.id,
    version: "1.0.0",
    approvedVocabulary: [
      { term: brand.name, preferred: true },
    ],
    bannedVocabulary,
    defaultTone: [
      { dimension: "formality", value: 0.8, description: "Professional and clear" },
      { dimension: "enthusiasm", value: 0.5, description: "Balanced tone" },
      { dimension: "directness", value: 0.9, description: "Action-oriented" },
    ],
    channelOverrides: [],
    requiredDisclaimers: [
      {
        context: "general",
        text: `${brand.name}. All rights reserved.`,
        placement: "footer",
      }
    ],
    publishedAt: new Date().toISOString(),
    publishedBy: `${brand.name} Brand Operations`,
  });
});

// GET /brands/:id/assets — list assets
brandsRoute.get("/:id/assets", async (c) => {
  const id = c.req.param("id");
  const brand = resolveBrand(id);

  return c.json([
    {
      id: `asset-logo-${brand.slug}`,
      brandId: brand.id,
      type: "logo",
      name: `${brand.name} Logotype Mark`,
      tags: ["logo", "primary", "branding"],
      url: `http://localhost:3737/api/v1/brands/assets/logo.png`,
      mimeType: "image/png",
      fileSizeBytes: 4096,
      dimensions: { width: 400, height: 100 },
      prohibitedUses: [
        "DO NOT skew or stretch the brand logo",
      ],
      uploadedAt: new Date().toISOString(),
      uploadedBy: "System Seeder",
    }
  ]);
});

// GET /brands/:id/audit — get audit log
brandsRoute.get("/:id/audit", async (c) => {
  const id = c.req.param("id");
  const brand = resolveBrand(id);

  return c.json([
    {
      id: `audit-1-${brand.slug}`,
      brandId: brand.id,
      action: "validate",
      actor: { id: "api-key-1", type: "api-key", name: "MCP Agent Validator" },
      target: { type: "artifact", name: "Landing page component" },
      details: { score: 100, violationsCount: 0, durationMs: 42 },
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    }
  ]);
});
