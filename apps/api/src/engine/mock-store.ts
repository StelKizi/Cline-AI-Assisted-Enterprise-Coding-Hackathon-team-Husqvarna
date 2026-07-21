import type { Brand, TokenSet, VoiceRules, Asset, AuditEntry } from "@kyra/brand-core";

export const MOCK_BRAND_ID = "d3b07384-d113-4ec5-a5d7-e0e6355e005c";
export const MOCK_ORGANIZATION_ID = "b02008fb-b8cc-4d3f-b883-7c87c71e21b2";

export const MOCK_BRAND: Brand = {
  id: MOCK_BRAND_ID,
  organizationId: MOCK_ORGANIZATION_ID,
  name: "Kyra Brand",
  slug: "kyra",
  description: "Brand intelligence platform — API-first brand state management",
  plan: "enterprise",
  apiCallsThisMonth: 12450,
  apiCallsLimit: 50000,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-06-12T08:00:00Z",
};

export const MOCK_TOKENS: TokenSet = {
  id: "273c52e4-e0eb-48b0-811c-99d821be005c",
  brandId: MOCK_BRAND_ID,
  name: "default",
  version: "1.2.0",
  groups: {
    color: {
      $description: "Brand color palette tokens",
      tokens: {
        "primary-600": { $type: "color", $value: "#6366f1", $description: "Indigo primary brand color" },
        "primary-700": { $type: "color", $value: "#4f46e5", $description: "Darker indigo for hovers" },
        "neutral-900": { $type: "color", $value: "#111827", $description: "Text dark neutral color" },
        "neutral-100": { $type: "color", $value: "#f3f4f6", $description: "Background light neutral color" },
        "accent-red": { $type: "color", $value: "#ef4444", $description: "Danger/Error accent color" },
        "accent-green": { $type: "color", $value: "#10b981", $description: "Success accent color" },
      },
    },
    spacing: {
      $description: "Layout spacing tokens",
      tokens: {
        sm: { $type: "dimension", $value: "8px" },
        md: { $type: "dimension", $value: "16px" },
        lg: { $type: "dimension", $value: "24px" },
      },
    },
    typography: {
      $description: "Standard text styles",
      tokens: {
        body: {
          $type: "typography",
          $value: {
            fontFamily: ["Inter", "sans-serif"],
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
          },
        },
        heading: {
          $type: "typography",
          $value: {
            fontFamily: ["Outfit", "sans-serif"],
            fontSize: "28px",
            fontWeight: "700",
            lineHeight: "1.2",
          },
        },
      },
    },
  },
  publishedAt: "2026-05-15T10:00:00Z",
  publishedBy: "Design System Bot",
};

export const MOCK_VOICE: VoiceRules = {
  id: "3e5a32ec-1f12-42da-92ee-91e82bc5005c",
  brandId: MOCK_BRAND_ID,
  version: "2.1.0",
  approvedVocabulary: [
    { term: "brand core", context: "Shared core types and logic", preferred: true },
    { term: "compliance", context: "Validation states", preferred: true },
    { term: "grounding", context: "LLM contextual injection", preferred: true },
    { term: "automated rules", context: "Instead of 'AI magic'", preferred: true },
  ],
  bannedVocabulary: [
    { term: "bag of vectors", reason: "Avoid slang/lowering technical precision", alternatives: ["embeddings", "semantic representation"] },
    { term: "black box", reason: "Negative governance connotation", alternatives: ["grounded logic", "explainable AI"] },
    { term: "foolproof", reason: "Unprofessional phrasing", alternatives: ["guaranteed compliance"] },
  ],
  defaultTone: [
    { dimension: "formality", value: 0.7, description: "Professional but accessible" },
    { dimension: "enthusiasm", value: 0.5, description: "Calm, objective, authoritative" },
    { dimension: "directness", value: 0.8, description: "Clear, simple, and action-oriented" },
  ],
  channelOverrides: [
    {
      channel: "linkedin",
      toneParameters: [
        { dimension: "formality", value: 0.5, description: "Slightly more conversational" },
        { dimension: "enthusiasm", value: 0.7, description: "More engaging and celebratory" },
      ],
      maxReadingGrade: 12,
      targetReadingGrade: 10,
    },
    {
      channel: "press-release",
      toneParameters: [
        { dimension: "formality", value: 0.9, description: "Highly formal and objective" },
        { dimension: "enthusiasm", value: 0.3, description: "Very low excitement, high factuality" },
      ],
      maxReadingGrade: 14,
      targetReadingGrade: 12,
      additionalGuidelines: ["Include official headquarters location", "Cite exact executive titles"],
    },
  ],
  requiredDisclaimers: [
    {
      context: "general-ai",
      text: "Validated by Kyra Brand Intelligence Engine. Verification code: KYRA-SECURE-2026.",
      placement: "footer",
    },
  ],
  publishedAt: "2026-05-18T14:30:00Z",
  publishedBy: "Content Governance Team",
};

export const MOCK_ASSETS: Asset[] = [
  {
    id: "f3c834a2-45df-427f-9721-aef4c7ef005c",
    brandId: MOCK_BRAND_ID,
    type: "logo",
    name: "Kyra Brandmark (Primary)",
    variant: "primary",
    tags: ["logo", "primary", "color", "horizontal"],
    url: "https://assets.kyra.ai/brand/logo-primary.png",
    thumbnailUrl: "https://assets.kyra.ai/brand/logo-primary-thumb.png",
    mimeType: "image/png",
    fileSizeBytes: 42150,
    dimensions: { width: 512, height: 128 },
    clearSpace: { unit: "x-height", top: 1, right: 1, bottom: 1, left: 1 },
    minimumSize: { width: 120, height: 30, unit: "px" },
    approvedBackgrounds: ["#ffffff", "#f3f4f6"],
    prohibitedUses: ["Do not stretch or skew", "Do not overlay on dark primary backgrounds"],
    uploadedAt: "2026-02-10T09:15:00Z",
    uploadedBy: "Brand Ops Manager",
  },
  {
    id: "a310c8bc-f921-4d33-87ef-b690c8a3005c",
    brandId: MOCK_BRAND_ID,
    type: "logo",
    name: "Kyra Icon (Monochrome)",
    variant: "icon-only",
    tags: ["logo", "icon", "monochrome", "social"],
    url: "https://assets.kyra.ai/brand/logo-icon.png",
    thumbnailUrl: "https://assets.kyra.ai/brand/logo-icon-thumb.png",
    mimeType: "image/png",
    fileSizeBytes: 15420,
    dimensions: { width: 256, height: 256 },
    clearSpace: { unit: "percentage", top: 15, right: 15, bottom: 15, left: 15 },
    minimumSize: { width: 32, height: 32, unit: "px" },
    prohibitedUses: ["Do not recolor using non-palette accent colors"],
    uploadedAt: "2026-02-10T09:18:00Z",
    uploadedBy: "Brand Ops Manager",
  },
  {
    id: "b4528ce0-5b12-4cf0-bbef-aeef3c8d005c",
    brandId: MOCK_BRAND_ID,
    type: "icon",
    name: "Compliance Badge Icon",
    tags: ["icon", "ui", "status", "success"],
    url: "https://assets.kyra.ai/brand/icon-compliance.svg",
    mimeType: "image/svg+xml",
    fileSizeBytes: 2450,
    uploadedAt: "2026-03-05T11:00:00Z",
    uploadedBy: "UI Design Lead",
  },
];

export const MOCK_AUDIT: AuditEntry[] = [
  {
    id: "5a0a382e-9d21-4f11-bef3-122e8ca0005c",
    brandId: MOCK_BRAND_ID,
    action: "validate",
    actor: { id: "api-key-9283", type: "api-key", name: "CI Pipeline Validator" },
    target: { type: "artifact", name: "LinkedIn Post (Summer Release)" },
    details: { score: 95, violationsCount: 1, durationMs: 142 },
    source: { plugin: "git-action", ip: "192.168.1.50" },
    timestamp: "2026-06-12T08:14:00Z",
  },
  {
    id: "6a52fc8d-291b-41da-a7ee-881c9ce1005c",
    brandId: MOCK_BRAND_ID,
    action: "transform",
    actor: { id: "usr-0123", type: "user", name: "Prince Orjiugo" },
    target: { type: "artifact", name: "Figma Pitch Deck v3" },
    details: { operationsApplied: ["recolor", "add-disclaimer"], scoreBefore: 65, scoreAfter: 100 },
    source: { plugin: "figma", ip: "10.167.220.11", userAgent: "Figma Desktop macOS" },
    timestamp: "2026-06-12T08:05:00Z",
  },
  {
    id: "72cc85fb-5b18-4cc0-92ef-c4ef3cb9005c",
    brandId: MOCK_BRAND_ID,
    action: "update-voice",
    actor: { id: "usr-0123", type: "user", name: "Prince Orjiugo" },
    target: { type: "voice-rules", name: "v2.1.0 Release" },
    details: { additions: ["grounding", "compliance"], removals: ["foolproof"] },
    timestamp: "2026-06-12T07:45:00Z",
  },
  {
    id: "8f5a28ce-ff9d-43da-bce1-d7ef8ca4005c",
    brandId: MOCK_BRAND_ID,
    action: "publish",
    actor: { id: "usr-0112", type: "user", name: "Sarah Connor" },
    target: { type: "token-set", name: "default" },
    details: { version: "1.2.0" },
    timestamp: "2026-06-11T16:20:00Z",
  },
  {
    id: "90b8fbc2-a128-4ce1-86ef-d7cf8ba2005c",
    brandId: MOCK_BRAND_ID,
    action: "validate",
    actor: { id: "api-key-9283", type: "api-key", name: "CI Pipeline Validator" },
    target: { type: "artifact", name: "Press Release (Corporate restructure)" },
    details: { score: 70, violationsCount: 4 },
    timestamp: "2026-06-11T12:00:00Z",
  },
];
