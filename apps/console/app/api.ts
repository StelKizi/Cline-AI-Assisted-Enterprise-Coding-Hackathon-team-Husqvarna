const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3737/api/v1";
export const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || "acme";

export async function fetchBrand(brandId: string = BRAND_ID) {
  try {
    const res = await fetch(`${API_BASE}/brands/${brandId}`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return {
      id: brandId,
      organizationId: "org-acme-99",
      name: "Acme Corporation",
      slug: "acme",
      description: "Brand intelligence platform — API-first brand state management",
      plan: "professional",
      apiCallsThisMonth: 12450,
      apiCallsLimit: 50000,
      status: "active",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function fetchTokens(brandId: string = BRAND_ID) {
  try {
    const res = await fetch(`${API_BASE}/brands/${brandId}/tokens`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return {
      id: `tokens-${brandId}`,
      brandId: brandId,
      name: "default",
      version: "1.0.0",
      groups: {
        color: {
          $description: "Brand color palette tokens",
          tokens: {
            "primary": { $type: "color", $value: "#6366f1", $description: "Primary brand accent" },
            "secondary": { $type: "color", $value: "#ec4899", $description: "Secondary brand accent" },
            "neutral-900": { $type: "color", $value: "#111827", $description: "Text dark neutral color" },
            "neutral-100": { $type: "color", $value: "#f3f4f6", $description: "Background light neutral color" },
          },
        },
      },
      publishedAt: new Date().toISOString(),
      publishedBy: "Design System Bot",
    };
  }
}

export async function fetchVoice(brandId: string = BRAND_ID) {
  try {
    const res = await fetch(`${API_BASE}/brands/${brandId}/voice`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return {
      id: `voice-${brandId}`,
      brandId: brandId,
      version: "1.0.0",
      approvedVocabulary: [
        { term: "brand core", preferred: true },
        { term: "compliance", preferred: true },
        { term: "grounding", preferred: true },
      ],
      bannedVocabulary: [
        { term: "bag of vectors", reason: "Avoid technical slang", alternatives: ["embeddings"] },
      ],
      defaultTone: [
        { dimension: "formality", value: 0.8 },
        { dimension: "enthusiasm", value: 0.5 },
        { dimension: "directness", value: 0.9 },
      ],
      channelOverrides: [],
      requiredDisclaimers: [],
      publishedAt: new Date().toISOString(),
      publishedBy: "Content Governance Team",
    };
  }
}

export async function fetchAssets(brandId: string = BRAND_ID) {
  try {
    const res = await fetch(`${API_BASE}/brands/${brandId}/assets`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchAudit(brandId: string = BRAND_ID) {
  try {
    const res = await fetch(`${API_BASE}/brands/${brandId}/audit`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      next: { revalidate: 0 },
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
