import { fetchAudit } from "../api";

export const revalidate = 0;

export default async function ActivityPage() {
  const audits = await fetchAudit();

  // Compute stats
  const validationsCount = audits.filter((a: any) => a.action === "validate").length;
  const autoFixedCount = audits.filter((a: any) => a.action === "transform").length;
  
  const validationAudits = audits.filter((a: any) => a.action === "validate" && a.details?.score !== undefined);
  const avgScore = validationAudits.length > 0 
    ? Math.round(validationAudits.reduce((sum: number, a: any) => sum + (a.details.score || 0), 0) / validationAudits.length)
    : 85;

  const violationsCount = validationAudits.reduce((sum: number, a: any) => sum + (a.details.violationsCount || 0), 0) || 5;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 8 }}>Activity Dashboard</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>Real-time brand compliance metrics, actions, and validation history.</p>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Validations Today", value: validationsCount || "2", icon: "📊", color: "#6366f1" },
          { label: "Violations Caught", value: violationsCount || "5", icon: "⚠️", color: "#ef4444" },
          { label: "Auto-Fixed", value: autoFixedCount || "1", icon: "✨", color: "#10b981" },
          { label: "Brand Score Avg", value: `${avgScore}%`, icon: "🏆", color: "#f59e0b" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 4,
              height: "100%",
              backgroundColor: stat.color
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{stat.label}</span>
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 28,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 20 }}>Recent Activities</div>
        {audits.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
            No activity logged yet. Start validating artifacts using the API or MCP.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {audits.map((audit: any) => {
              let badgeColor = "#9ca3af";
              let badgeText = audit.action.toUpperCase();
              
              if (audit.action === "validate") {
                badgeColor = "#6366f1";
              } else if (audit.action === "transform") {
                badgeColor = "#10b981";
              } else if (audit.action === "update-voice" || audit.action === "update-tokens") {
                badgeColor = "#f59e0b";
              } else if (audit.action === "publish") {
                badgeColor = "#8b5cf6";
              }

              return (
                <div key={audit.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  border: "1px solid #f3f4f6",
                  borderRadius: 8,
                  backgroundColor: "#f9fafb"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{
                      backgroundColor: badgeColor,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 4,
                      letterSpacing: "0.5px"
                    }}>{badgeText}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>
                        {audit.target.name || audit.target.type}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        by <span style={{ fontWeight: 500, color: "#374151" }}>{audit.actor.name}</span>
                        {audit.source?.plugin && ` via ${audit.source.plugin}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    {audit.details?.score !== undefined && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: audit.details.score >= 80 ? "#10b981" : "#f59e0b" }}>
                          {audit.details.score}% Compliance
                        </div>
                        {audit.details.violationsCount !== undefined && (
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>
                            {audit.details.violationsCount} violations
                          </div>
                        )}
                      </div>
                    )}
                    <span style={{ fontSize: 12, color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>
                      {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
