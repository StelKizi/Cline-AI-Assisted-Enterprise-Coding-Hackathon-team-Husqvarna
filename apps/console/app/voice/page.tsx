export default function VoicePage() {
  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Voice &amp; Tone</h1>
        <p className="text-sm text-gray-500 mt-1">Vocabulary rules, tone parameters, and channel-specific voice</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in">
          <div className="text-sm font-semibold text-gray-700 mb-3">Approved Vocabulary</div>
          {["innovative", "empower", "streamline", "scalable", "transform"].map((w) => (
            <span key={w} className="inline-block bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full mr-2 mb-2">{w}</span>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in">
          <div className="text-sm font-semibold text-gray-700 mb-3">Banned Vocabulary</div>
          {["synergy", "leverage", "disrupt", "guru", "rockstar", "ninja"].map((w) => (
            <span key={w} className="inline-block bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full mr-2 mb-2">{w}</span>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in col-span-2">
          <div className="text-sm font-semibold text-gray-700 mb-3">Tone Parameters</div>
          {[
            { param: "Formality", value: 65 },
            { param: "Enthusiasm", value: 72 },
            { param: "Technical depth", value: 55 },
            { param: "Humor", value: 30 },
          ].map((t) => (
            <div key={t.param} className="flex items-center gap-3 mb-3">
              <span className="text-sm text-gray-600 w-32">{t.param}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-bar-fill" style={{ width: `${t.value}%` }} />
              </div>
              <span className="text-xs text-gray-500 tabular-nums w-8">{t.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
