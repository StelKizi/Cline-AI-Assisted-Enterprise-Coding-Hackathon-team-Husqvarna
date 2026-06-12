import { fetchVoice } from "../api";

export const revalidate = 0;

export default async function VoicePage() {
  let approvedVocabulary: any[] = [];
  let bannedVocabulary: any[] = [];
  let defaultTone: any[] = [];
  let requiredDisclaimers: any[] = [];

  try {
    const data = await fetchVoice();
    approvedVocabulary = data.approvedVocabulary || [];
    bannedVocabulary = data.bannedVocabulary || [];
    defaultTone = data.defaultTone || [];
    requiredDisclaimers = data.requiredDisclaimers || [];
  } catch (err) {
    approvedVocabulary = [
      { term: "Forest & Garden", preferred: true },
      { term: "Active Green", preferred: true },
    ];
    bannedVocabulary = [
      { term: "bag of vectors", reason: "Avoid technical slang", alternatives: ["embeddings"] },
    ];
    defaultTone = [
      { dimension: "formality", value: 0.8 },
      { dimension: "enthusiasm", value: 0.4 },
      { dimension: "directness", value: 0.9 },
    ];
  }

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Voice &amp; Tone Guidelines</h1>
        <p className="text-sm text-gray-500 mt-1">Vocabulary governance rules and tone specifications for Husqvarna Forest &amp; Garden</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Approved Vocab */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-50 pb-2">Approved Vocabulary</div>
          <div className="flex flex-wrap gap-2">
            {approvedVocabulary.map((vocab) => (
              <span key={vocab.term} className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200" title={vocab.context}>
                {vocab.term}
              </span>
            ))}
          </div>
        </div>

        {/* Banned Vocab */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-50 pb-2">Banned Vocabulary (Forbidden Patterns)</div>
          <div className="space-y-2.5">
            {bannedVocabulary.map((vocab) => (
              <div key={vocab.term} className="flex flex-col p-2.5 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-red-700 font-mono">{vocab.term}</span>
                  {vocab.alternatives && (
                    <span className="text-[10px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">
                      Use: {vocab.alternatives.join(", ")}
                    </span>
                  )}
                </div>
                {vocab.reason && <span className="text-[10px] text-gray-500 mt-1">Reason: {vocab.reason}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tone parameters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="text-sm font-semibold text-gray-700 mb-5 border-b border-gray-50 pb-2">Tone Parameters Profile</div>
        <div className="space-y-4">
          {defaultTone.map((t) => (
            <div key={t.dimension} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 w-32 capitalize">{t.dimension}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${t.value * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-500 tabular-nums w-10 text-right">{Math.round(t.value * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers */}
      {requiredDisclaimers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-50 pb-2">Mandatory Brand Disclaimers</div>
          <div className="space-y-3">
            {requiredDisclaimers.map((disc, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 font-mono leading-relaxed italic">
                "{disc.text}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
