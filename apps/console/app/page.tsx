// ─── Console Home: Activity Feed ────────────────────────────────────
// What was validated, fixed, published. Filterable by team/channel/severity.

export default function ActivityPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Activity</h1>

      {/* Drift report summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Validations today", value: "—" },
          { label: "Violations caught", value: "—" },
          { label: "Auto-fixed", value: "—" },
          { label: "Brand score avg", value: "—" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity table placeholder */}
      <div style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        padding: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recent Activity</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#888" }}>Time</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#888" }}>Action</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#888" }}>Actor</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#888" }}>Source</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#888" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                No activity yet. Connect the API or a plugin to start.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
