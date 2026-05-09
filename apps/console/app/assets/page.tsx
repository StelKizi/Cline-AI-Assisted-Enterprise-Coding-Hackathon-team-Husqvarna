export default function AssetsPage() {
  const assets = [
    { name: "Logo – Primary", type: "SVG", variants: 4, status: "approved" },
    { name: "Logo – Monochrome", type: "SVG", variants: 2, status: "approved" },
    { name: "Icon Set", type: "SVG", variants: 48, status: "approved" },
    { name: "Hero Illustration", type: "PNG", variants: 3, status: "review" },
    { name: "Social Banner Template", type: "Figma", variants: 6, status: "approved" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
        <p className="text-sm text-gray-500 mt-1">Managed brand assets with clear-space rules and variants</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Asset</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Type</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Variants</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{a.name}</td>
                <td className="px-5 py-3 text-gray-500">{a.type}</td>
                <td className="px-5 py-3 text-gray-500 tabular-nums">{a.variants}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    a.status === "approved" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
