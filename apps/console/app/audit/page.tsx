export default function AuditPage() {
  const entries = [
    { ts: "2025-01-15 14:32", action: "token.update", actor: "Sarah K.", detail: "Changed brand.primary #1A73E8 → #1565C0" },
    { ts: "2025-01-15 12:01", action: "voice.add", actor: "James L.", detail: "Added 'leverage' to banned vocabulary" },
    { ts: "2025-01-14 18:45", action: "asset.approve", actor: "Brand Lead", detail: "Approved Hero Illustration v3" },
    { ts: "2025-01-14 09:12", action: "policy.update", actor: "Admin", detail: "Updated FDA disclaimer for health channel" },
    { ts: "2025-01-13 16:30", action: "pattern.create", actor: "Priya M.", detail: "Created Card component pattern" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Every change to the Brand Core, timestamped and attributed</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Timestamp</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Action</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Actor</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{e.ts}</td>
                <td className="px-5 py-3">
                  <code className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded">{e.action}</code>
                </td>
                <td className="px-5 py-3 text-gray-700">{e.actor}</td>
                <td className="px-5 py-3 text-gray-600">{e.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
