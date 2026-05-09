// ─── Activity Dashboard ─────────────────────────────────────────────
// What was validated, fixed, published. The brand lead's home base.

export default function ActivityPage() {
  const stats = [
    { label: "Validations today", value: "147", trend: "+12%", good: true },
    { label: "Violations caught", value: "23", trend: "-8%", good: true },
    { label: "Auto-fixed", value: "18", trend: "+5%", good: true },
    { label: "Brand score avg", value: "87", trend: "+3", good: true },
  ];

  const recentActivity = [
    { time: "2 min ago", action: "validate", actor: "Sarah K.", source: "Figma plugin", score: 92 },
    { time: "15 min ago", action: "transform", actor: "API (CI)", source: "GitHub Action", score: 100 },
    { time: "23 min ago", action: "validate", actor: "James L.", source: "Canva plugin", score: 71 },
    { time: "1 hr ago", action: "ground", actor: "Claude (MCP)", source: "MCP Server", score: null },
    { time: "1 hr ago", action: "validate", actor: "Priya M.", source: "Figma plugin", score: 95 },
    { time: "2 hr ago", action: "approve", actor: "Brand Lead", source: "Console", score: null },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Activity</h1>
        <p className="text-sm text-gray-500 mt-1">Brand compliance overview across all surfaces</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            <div className={`text-xs mt-2 font-medium ${stat.good ? "text-green-600" : "text-red-600"}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Drift report */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in" style={{ animationDelay: "240ms" }}>
          <div className="text-sm font-semibold text-gray-700 mb-3">Top violations</div>
          {["Off-palette colors (34%)", "Banned vocabulary (22%)", "Reading level too high (18%)", "Missing disclaimer (12%)"].map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {v}
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="text-sm font-semibold text-gray-700 mb-3">By team</div>
          {["Marketing — 87 avg score", "Product — 91 avg score", "Sales — 78 avg score", "Partners — 72 avg score"].map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${i < 2 ? "bg-green-400" : "bg-yellow-400"}`} />
              {v}
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in" style={{ animationDelay: "360ms" }}>
          <div className="text-sm font-semibold text-gray-700 mb-3">By channel</div>
          {["LinkedIn — 91 avg", "Email — 85 avg", "Website — 88 avg", "Press — 94 avg"].map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white border border-gray-200 rounded-xl animate-fade-in" style={{ animationDelay: "420ms" }}>
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-700">Recent Activity</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-2.5 font-medium text-gray-500 text-xs">Time</th>
              <th className="px-5 py-2.5 font-medium text-gray-500 text-xs">Action</th>
              <th className="px-5 py-2.5 font-medium text-gray-500 text-xs">Actor</th>
              <th className="px-5 py-2.5 font-medium text-gray-500 text-xs">Source</th>
              <th className="px-5 py-2.5 font-medium text-gray-500 text-xs">Score</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((entry, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-500">{entry.time}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    entry.action === "validate" ? "bg-blue-50 text-blue-700" :
                    entry.action === "transform" ? "bg-purple-50 text-purple-700" :
                    entry.action === "ground" ? "bg-amber-50 text-amber-700" :
                    "bg-green-50 text-green-700"
                  }`}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">{entry.actor}</td>
                <td className="px-5 py-3 text-gray-500">{entry.source}</td>
                <td className="px-5 py-3">
                  {entry.score !== null ? (
                    <span className={`font-semibold tabular-nums ${
                      entry.score >= 90 ? "text-green-600" :
                      entry.score >= 75 ? "text-yellow-600" :
                      "text-red-600"
                    }`}>
                      {entry.score}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
