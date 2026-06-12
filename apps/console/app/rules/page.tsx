import { fetchTokens, fetchVoice } from "../api";

export const revalidate = 0;

export default async function RulesPage() {
  const tokens = await fetchTokens();
  const voice = await fetchVoice();

  const colorTokens = tokens.groups?.color?.tokens || {};
  const spacingTokens = tokens.groups?.spacing?.tokens || {};
  const toneParams = voice.defaultTone || [];
  const approvedVocab = voice.approvedVocabulary || [];
  const bannedVocab = voice.bannedVocabulary || [];
  const disclaimers = voice.requiredDisclaimers || [];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 8 }}>Brand Guidelines & Rules</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>Authoritative guidelines, design tokens, voice standards, and rules.</p>

      {/* Grid: Tokens & Tone */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
        {/* Color Palette Tokens */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Design Tokens: Color Palette</h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>Approved color tokens used for verification.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(colorTokens).map(([name, token]: [string, any]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    backgroundColor: token.$value,
                    border: "1px solid #e5e7eb",
                    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.1)"
                  }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{token.$description || "No description"}</div>
                  </div>
                </div>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#4b5563", backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: 4 }}>
                  {token.$value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice & Tone Parameters */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Voice & Tone Profile</h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>Calibrated dimensions for communication.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {toneParams.map((param: any) => (
              <div key={param.dimension}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>{param.dimension}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5" }}>{Math.round(param.value * 100)}%</span>
                </div>
                <div style={{ width: "100%", height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${param.value * 100}%`, height: "100%", backgroundColor: "#4f46e5", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{param.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Approved vs Banned Vocabulary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
        {/* Approved Vocabulary */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Approved Vocabulary</h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>Preferred terms to ensure clarity and consistency.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {approvedVocab.map((vocab: any) => (
              <div key={vocab.term} style={{ borderLeft: "3px solid #10b981", paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{vocab.term}</span>
                {vocab.context && (
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Context: {vocab.context}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Banned Vocabulary */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Banned Vocabulary</h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>Terms that violate brand policy and guidelines.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {bannedVocab.map((vocab: any) => (
              <div key={vocab.term} style={{ borderLeft: "3px solid #ef4444", paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", textDecoration: "line-through" }}>{vocab.term}</span>
                  {vocab.alternatives && vocab.alternatives.length > 0 && (
                    <span style={{ fontSize: 11, color: "#10b981", backgroundColor: "#ecfdf5", padding: "2px 6px", borderRadius: 4, fontWeight: 500 }}>
                      Use: {vocab.alternatives.join(", ")}
                    </span>
                  )}
                </div>
                {vocab.reason && (
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Reason: {vocab.reason}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimers Section */}
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 28,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Required Disclaimers</h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>Mandatory text snippets that must appear in brand publications.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {disclaimers.map((disc: any, idx: number) => (
            <div key={idx} style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px dashed #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase" }}>Context: {disc.context}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", backgroundColor: "#e0e7ff", padding: "2px 6px", borderRadius: 4 }}>
                  Placement: {disc.placement}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#4b5563", fontStyle: "italic", lineHeight: "1.4" }}>
                "{disc.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
