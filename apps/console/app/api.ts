const API_BASE = "http://localhost:3737/api/v1";
export const BRAND_ID = "d3b07384-d113-4ec5-a5d7-e0e6355e005c";

export async function fetchBrand() {
  try {
    const res = await fetch(`${API_BASE}/brands/${BRAND_ID}`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return {
      id: BRAND_ID,
      organizationId: "b02008fb-b8cc-4d3f-b883-7c87c71e21b2",
      name: "Kyra Brand (Standalone)",
      slug: "kyra",
      description: "Brand intelligence platform — API-first brand state management",
      plan: "enterprise",
      apiCallsThisMonth: 12450,
      apiCallsLimit: 50000,
      status: "active",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-06-12T08:00:00Z",
    };
  }
}

export async function fetchTokens() {
  try {
    const res = await fetch(`${API_BASE}/brands/${BRAND_ID}/tokens`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return {
      id: "273c52e4-e0eb-48b0-811c-99d821be005c",
      brandId: BRAND_ID,
      name: "default",
      version: "1.2.0",
      groups: {
        color: {
          $description: "Brand color palette tokens",
          tokens: {
            "primary-600": { $type: "color", $value: "#6366f1" },
            "primary-700": { $type: "color", $value: "#4f46e5" },
            "neutral-900": { $type: "color", $value: "#111827" },
            "neutral-100": { $type: "color", $value: "#f3f4f6" },
          },
        },
      },
      publishedAt: "2026-05-15T10:00:00Z",
      publishedBy: "Design System Bot",
    };
  }
}

export async function fetchVoice() {
  try {
    const res = await fetch(`${API_BASE}/brands/${BRAND_ID}/voice`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return {
      id: "3e5a32ec-1f12-42da-92ee-91e82bc5005c",
      brandId: BRAND_ID,
      version: "2.1.0",
      approvedVocabulary: [
        { term: "brand core", preferred: true },
        { term: "compliance", preferred: true },
        { term: "grounding", preferred: true },
      ],
      bannedVocabulary: [
        { term: "bag of vectors", reason: "Avoid technical slang", alternatives: ["embeddings"] },
      ],
      defaultTone: [
        { dimension: "formality", value: 0.7 },
        { dimension: "enthusiasm", value: 0.5 },
        { dimension: "directness", value: 0.8 },
      ],
      channelOverrides: [],
      requiredDisclaimers: [],
      publishedAt: "2026-05-18T14:30:00Z",
      publishedBy: "Content Governance Team",
    };
  }
}

export async function fetchAssets() {
  try {
    const res = await fetch(`${API_BASE}/brands/${BRAND_ID}/assets`, {
      headers: { "X-API-Key": "kyra-dev-key" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchAudit() {
  try {
    const res = await fetch(`${API_BASE}/brands/${BRAND_ID}/audit`, {
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
