import { Hono } from "hono";
import { getTokens, getBannedTerms } from "../engine/brand-state.js";

export const brandsRoute = new Hono();

const HUSQVARNA_BRAND_ID = "d3b07384-d113-4ec5-a5d7-e0e6355e005c";

const HUSQVARNA_BRAND_DETAILS = {
  id: HUSQVARNA_BRAND_ID,
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
};

// GET /brands - List brands
brandsRoute.get("/", async (c) => {
  return c.json([HUSQVARNA_BRAND_DETAILS]);
});

// GET /brands/:id — get brand state summary
brandsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (id !== HUSQVARNA_BRAND_ID && id !== "current") {
    return c.json({ error: "Brand not found" }, 404);
  }
  return c.json(HUSQVARNA_BRAND_DETAILS);
});

// GET /brands/:id/tokens — get current token set
brandsRoute.get("/:id/tokens", async (c) => {
  const id = c.req.param("id");
  if (id !== HUSQVARNA_BRAND_ID && id !== "current") {
    return c.json({ error: "Brand not found" }, 404);
  }
  const rawTokens = getTokens();

  // Wrap in TokenSet schema format
  return c.json({
    id: "273c52e4-e0eb-48b0-811c-99d821be005c",
    brandId: HUSQVARNA_BRAND_ID,
    name: "default",
    version: "1.0.0",
    groups: rawTokens,
    publishedAt: "2026-05-08T20:00:00Z",
    publishedBy: "Husqvarna Design System Builder",
  });
});

// GET /brands/:id/voice — get current voice rules
brandsRoute.get("/:id/voice", async (c) => {
  const id = c.req.param("id");
  if (id !== HUSQVARNA_BRAND_ID && id !== "current") {
    return c.json({ error: "Brand not found" }, 404);
  }

  const bannedVocabulary = getBannedTerms();

  return c.json({
    id: "3e5a32ec-1f12-42da-92ee-91e82bc5005c",
    brandId: HUSQVARNA_BRAND_ID,
    version: "1.0.0",
    approvedVocabulary: [
      { term: "Forest & Garden", preferred: true },
      { term: "Husqvarna Blue", preferred: true },
      { term: "Active Green", preferred: true },
      { term: "Husqvarna Orange", preferred: true },
    ],
    bannedVocabulary,
    defaultTone: [
      { dimension: "formality", value: 0.8, description: "Professional and objective" },
      { dimension: "enthusiasm", value: 0.4, description: "Low excitement, high factuality" },
      { dimension: "directness", value: 0.9, description: "Action-oriented and precise" },
    ],
    channelOverrides: [],
    requiredDisclaimers: [
      {
        context: "general",
        text: "Husqvarna Forest & Garden. All rights reserved.",
        placement: "footer",
      }
    ],
    publishedAt: "2026-05-08T20:00:00Z",
    publishedBy: "Husqvarna Brand Operations",
  });
});

// GET /brands/:id/assets — list assets
brandsRoute.get("/:id/assets", async (c) => {
  const id = c.req.param("id");
  if (id !== HUSQVARNA_BRAND_ID && id !== "current") {
    return c.json({ error: "Brand not found" }, 404);
  }

  return c.json([
    {
      id: "f3c834a2-45df-427f-9721-aef4c7ef005c",
      brandId: HUSQVARNA_BRAND_ID,
      type: "logo",
      name: "Husqvarna Logotype Stamp",
      tags: ["logo", "primary", "branding"],
      url: "http://localhost:3737/api/v1/brands/assets/husqvarna-logotype.webp",
      mimeType: "image/webp",
      fileSizeBytes: 4782,
      dimensions: { width: 440, height: 80 },
      prohibitedUses: [
        "MUST display Husqvarna logotype stamp in upper-left corner",
        "NEVER skew, rotate, or modify the brand mark color",
      ],
      uploadedAt: "2026-05-08T20:00:00Z",
      uploadedBy: "System Seeder",
    },
    {
      id: "hero-lifestyle-9821",
      brandId: HUSQVARNA_BRAND_ID,
      type: "photography",
      name: "Editorial Lifestyle Hero",
      tags: ["hero", "lifestyle", "editorial"],
      url: "http://localhost:3737/api/v1/brands/assets/people-and-lifestyle-ch-635665.webp",
      mimeType: "image/webp",
      fileSizeBytes: 291076,
      dimensions: { width: 1920, height: 1080 },
      prohibitedUses: [
        "DO NOT crop out active machinery safety elements",
        "Use only as full-width hero background images",
      ],
      uploadedAt: "2026-06-12T10:00:00Z",
      uploadedBy: "System Seeder",
    },
    {
      id: "product-chainsaw-550i",
      brandId: HUSQVARNA_BRAND_ID,
      type: "photography",
      name: "Husqvarna 550i XP Chainsaw",
      tags: ["product", "chainsaw", "spotlight"],
      url: "http://localhost:3737/api/v1/brands/assets/550i-xp-chainsaw.webp",
      mimeType: "image/webp",
      fileSizeBytes: 39648,
      dimensions: { width: 600, height: 400 },
      prohibitedUses: [
        "Use for chainsaw product spotlight or pricing cards",
        "Do not place on highly saturated backgrounds",
      ],
      uploadedAt: "2026-06-12T10:00:00Z",
      uploadedBy: "System Seeder",
    },
    {
      id: "product-mower-aspire",
      brandId: HUSQVARNA_BRAND_ID,
      type: "photography",
      name: "Automower Aspire R6v",
      tags: ["product", "mower", "robotic"],
      url: "http://localhost:3737/api/v1/brands/assets/automower-aspire-r6v.webp",
      mimeType: "image/webp",
      fileSizeBytes: 18540,
      dimensions: { width: 500, height: 350 },
      prohibitedUses: [
        "Use for robotic lawn mower product cards",
        "Must display clean-space border padding around wheels",
      ],
      uploadedAt: "2026-06-12T10:00:00Z",
      uploadedBy: "System Seeder",
    },
    {
      id: "reference-acc-lifestyle",
      brandId: HUSQVARNA_BRAND_ID,
      type: "photography",
      name: "Robotic Mower Accessories",
      tags: ["accessory", "lifestyle", "ecosystem"],
      url: "http://localhost:3737/api/v1/brands/assets/robotic-mower-accessories-vs-156023.webp",
      mimeType: "image/webp",
      fileSizeBytes: 228156,
      dimensions: { width: 1200, height: 800 },
      prohibitedUses: [
        "Reference use for ecosystem features and user manuals",
      ],
      uploadedAt: "2026-06-12T10:00:00Z",
      uploadedBy: "System Seeder",
    },
    {
      id: "reference-studio-mower",
      brandId: HUSQVARNA_BRAND_ID,
      type: "photography",
      name: "Robotic Mower Studio Reference",
      tags: ["studio", "reference"],
      url: "http://localhost:3737/api/v1/brands/assets/robotic-mower-studio-h310-1892.webp",
      mimeType: "image/webp",
      fileSizeBytes: 11932,
      dimensions: { width: 400, height: 300 },
      prohibitedUses: [
        "Studio reference layout context only",
      ],
      uploadedAt: "2026-06-12T10:00:00Z",
      uploadedBy: "System Seeder",
    }
  ]);
});

// GET /brands/:id/audit — get audit log
brandsRoute.get("/:id/audit", async (c) => {
  const id = c.req.param("id");
  if (id !== HUSQVARNA_BRAND_ID && id !== "current") {
    return c.json({ error: "Brand not found" }, 404);
  }

  return c.json([
    {
      id: "5a0a382e-9d21-4f11-bef3-122e8ca0005c",
      brandId: HUSQVARNA_BRAND_ID,
      action: "validate",
      actor: { id: "api-key-9283", type: "api-key", name: "CI Pipeline Validator" },
      target: { type: "artifact", name: "Landing page HTML (Main)" },
      details: { score: 92, violationsCount: 1, durationMs: 98 },
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    },
    {
      id: "6a52fc8d-291b-41da-a7ee-881c9ce1005c",
      brandId: HUSQVARNA_BRAND_ID,
      action: "update-tokens",
      actor: { id: "usr-0123", type: "user", name: "Stella Kiziridou" },
      target: { type: "token-set", name: "default" },
      details: { message: "Adjusted colors to add +10% black mixed in per brand spec" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    }
  ]);
});

// GET /brands/assets/:filename — Serve WebP assets dynamically
brandsRoute.get("/assets/:filename", async (c) => {
  const filename = c.req.param("filename");
  const fs = await import("node:fs");
  const path = await import("node:path");
  
  let filePath = "";
  if (filename === "husqvarna-logotype.webp") {
    filePath = path.resolve(process.cwd(), "../../kyra-mcp/design_system/assets/husqvarna-logotype.webp");
  } else if (filename === "550i-xp-chainsaw.webp" || filename === "automower-aspire-r6v.webp") {
    filePath = path.resolve(process.cwd(), `../../husqvarna_assets/images/products/${filename}`);
  } else if (filename === "people-and-lifestyle-ch-635665.webp") {
    filePath = path.resolve(process.cwd(), `../../husqvarna_assets/images/hero/${filename}`);
  } else if (filename === "robotic-mower-accessories-vs-156023.webp" || filename === "robotic-mower-studio-h310-1892.webp") {
    filePath = path.resolve(process.cwd(), `../../husqvarna_assets/images/reference/${filename}`);
  } else {
    return c.text("Asset not found", 404);
  }

  try {
    const file = fs.readFileSync(filePath);
    return c.body(file, 200, { "Content-Type": "image/webp" });
  } catch (err) {
    return c.text("Error reading asset file", 404);
  }
});
