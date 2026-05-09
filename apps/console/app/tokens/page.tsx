export default function TokensPage() {
  const tokenGroups = [
    {
      name: "Color – Brand",
      tokens: [
        { name: "brand.primary", value: "#1A73E8", preview: "bg" },
        { name: "brand.secondary", value: "#174EA6", preview: "bg" },
        { name: "brand.accent", value: "#34A853", preview: "bg" },
      ],
    },
    {
      name: "Color – Neutral",
      tokens: [
        { name: "neutral.900", value: "#1F1F1F", preview: "bg" },
        { name: "neutral.600", value: "#5F6368", preview: "bg" },
        { name: "neutral.100", value: "#F1F3F4", preview: "bg" },
      ],
    },
    {
      name: "Spacing",
      tokens: [
        { name: "spacing.xs", value: "4px" },
        { name: "spacing.sm", value: "8px" },
        { name: "spacing.md", value: "16px" },
        { name: "spacing.lg", value: "24px" },
        { name: "spacing.xl", value: "32px" },
      ],
    },
    {
      name: "Typography",
      tokens: [
        { name: "font.heading", value: "Inter, 600" },
        { name: "font.body", value: "Inter, 400" },
        { name: "font.mono", value: "Fira Code, 400" },
      ],
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Design Tokens</h1>
        <p className="text-sm text-gray-500 mt-1">W3C Design Tokens powering every surface</p>
      </div>
      <div className="space-y-6">
        {tokenGroups.map((group) => (
          <div key={group.name} className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in">
            <div className="text-sm font-semibold text-gray-700 mb-3">{group.name}</div>
            <div className="space-y-2">
              {group.tokens.map((t) => (
                <div key={t.name} className="flex items-center gap-3 text-sm">
                  {t.preview === "bg" && (
                    <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: t.value }} />
                  )}
                  <code className="text-gray-800 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{t.name}</code>
                  <span className="text-gray-400 ml-auto font-mono text-xs">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
