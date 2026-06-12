"use client";

import { useEffect, useState } from "react";
import {
  fetchBrand,
  fetchTokens,
  fetchVoice,
  fetchAssets,
  fetchAudit,
} from "../api";
import {
  Sparkles,
  Palette,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  ChevronRight,
  Code,
  Globe,
  Settings,
  AlertTriangle,
  FileCode,
} from "lucide-react";

interface Token {
  name: string;
  value: string;
}

export default function BrandPlacePage() {
  const [brand, setBrand] = useState<any>(null);
  const [tokens, setTokens] = useState<any>(null);
  const [voice, setVoice] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Playground state
  const [playgroundComponent, setPlaygroundComponent] = useState("Button");
  const [playgroundCode, setPlaygroundCode] = useState(
    `<Button variant="primary" size="md">\n  Explore Mowers\n</Button>`
  );
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrandData() {
      try {
        const [brandData, tokensData, voiceData, assetsData] = await Promise.all([
          fetchBrand(),
          fetchTokens(),
          fetchVoice(),
          fetchAssets(),
        ]);
        setBrand(brandData);
        setTokens(tokensData);
        setVoice(voiceData);
        setAssets(assetsData);
      } catch (e) {
        console.error("Failed to load brand place data", e);
      } finally {
        setLoading(false);
      }
    }
    loadBrandData();
  }, []);

  async function runPlaygroundScorecard() {
    setPlaygroundLoading(true);
    setPlaygroundError(null);
    setPlaygroundResult(null);
    try {
      const res = await fetch("http://localhost:8000/compliance-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          component_name: playgroundComponent,
          code: playgroundCode,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setPlaygroundResult(data);
    } catch (e: any) {
      setPlaygroundError(e.message || "Failed to contact compliance server on port 8000");
    } finally {
      setPlaygroundLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-gray-900/10 border-t-gray-900 rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500">Loading Brand Place...</span>
      </div>
    );
  }

  // Extract color tokens
  const colorGroups = tokens?.groups?.color?.tokens || {};
  const approvedColors = Object.entries(colorGroups).map(([name, val]: [string, any]) => ({
    name: `color.${name}`,
    value: val.$value || val,
    description: val.$description || "Design token color",
  }));

  // Default colors fallback if empty
  const displayColors = approvedColors.length > 0 ? approvedColors : [
    { name: "color.brand.primary", value: "#00468C", description: "Husqvarna Navy Blue" },
    { name: "color.brand.accent", value: "#C45A00", description: "Husqvarna Active Orange" },
    { name: "color.brand.neutral-dark", value: "#0A0A0B", description: "Soot Black Neutrals" },
    { name: "color.brand.neutral-light", value: "#F4F5F6", description: "Cool Grey Neutrals" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Header Area: Brand Identity Card */}
      <div className="relative overflow-hidden bg-gray-950 text-white rounded-2xl p-8 shadow-xl border border-gray-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Logo display */}
            <div className="bg-white p-4 rounded-xl flex items-center justify-center border border-gray-800 h-20 w-44 shadow-md shrink-0">
              {assets.length > 0 ? (
                <img
                  src={assets[0].url}
                  alt={brand?.name || "Husqvarna"}
                  className="max-h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-gray-900 font-extrabold text-xl tracking-tight">Husqvarna</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">{brand?.name || "Husqvarna Forest & Garden"}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                  {brand?.status || "Active"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700 capitalize">
                  {brand?.plan || "Enterprise"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2 max-w-xl">
                {brand?.description || "W3C-compliant design tokens, regulatory disclaimers, and voice rules for public properties."}
              </p>
              <div className="text-xs text-gray-500 mt-2.5 flex items-center gap-4">
                <span>Slug: <strong className="text-gray-300 font-mono">{brand?.slug || "husqvarna"}</strong></span>
                <span>•</span>
                <span>ID: <strong className="text-gray-300 font-mono text-[10px]">{brand?.id}</strong></span>
              </div>
            </div>
          </div>

          {/* API meter */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:w-64">
            <div className="flex justify-between text-xs text-gray-400 font-medium mb-1.5">
              <span>API usage (this month)</span>
              <span>{brand?.apiCallsThisMonth?.toLocaleString() || "14,520"} / {brand?.apiCallsLimit?.toLocaleString() || "100,000"}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${((brand?.apiCallsThisMonth || 14520) / (brand?.apiCallsLimit || 100000)) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-1.5 text-right font-mono">
              Last synced: {brand?.updatedAt ? new Date(brand.updatedAt).toLocaleTimeString() : "Just now"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid: Tokens and Voice Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Brand Styles & Colors */}
        <div className="space-y-8">
          {/* Colors Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Palette className="text-blue-600" size={18} />
              <h2 className="text-sm font-semibold text-gray-800">Design System Colors</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Approved color tokens applied to verify brand assets and generated layouts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayColors.map((color: any) => (
                <div key={color.name} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <div
                    className="w-12 h-12 rounded-lg border border-gray-200 shadow-inner shrink-0"
                    style={{ backgroundColor: color.value }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold text-gray-800 truncate">{color.name}</div>
                    <div className="text-[11px] text-gray-600 font-mono mt-0.5">{color.value}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate">{color.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FileText className="text-orange-500" size={18} />
              <h2 className="text-sm font-semibold text-gray-800">Voice &amp; Tone Profile</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Calibrated dimensions for messaging and content generations.
            </p>

            <div className="space-y-4">
              {(voice?.defaultTone || []).map((t: any) => (
                <div key={t.dimension} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                    <span className="capitalize">{t.dimension}</span>
                    <span className="text-blue-600">{Math.round(t.value * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${t.value * 100}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400">{t.description}</div>
                </div>
              ))}

              {(!voice?.defaultTone || voice.defaultTone.length === 0) && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                    <span>Formality</span>
                    <span className="text-blue-600">80%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "80%" }} />
                  </div>
                  <div className="text-[10px] text-gray-400">Professional and objective</div>

                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                    <span>Enthusiasm</span>
                    <span className="text-blue-600">40%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "40%" }} />
                  </div>
                  <div className="text-[10px] text-gray-400">Low excitement, factual and clean</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Vocabulary Rules & Assets */}
        <div className="space-y-8">
          {/* Vocabulary Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <ShieldCheck className="text-green-600" size={18} />
              <h2 className="text-sm font-semibold text-gray-800">Vocabulary Governance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">Preferred Terms</h3>
                <div className="flex flex-wrap gap-1.5">
                  {(voice?.approvedVocabulary || []).map((v: any) => (
                    <span key={v.term} className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-150">
                      {v.term}
                    </span>
                  ))}
                  {(!voice?.approvedVocabulary || voice.approvedVocabulary.length === 0) && (
                    <>
                      <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-150">Forest &amp; Garden</span>
                      <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-150">Active Green</span>
                      <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-150">Husqvarna Orange</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">Banned Terms</h3>
                <div className="space-y-1.5">
                  {(voice?.bannedVocabulary || []).map((v: any) => (
                    <div key={v.term} className="text-xs bg-red-50 text-red-800 border border-red-100 p-2 rounded">
                      <span className="line-through font-mono font-bold text-red-700">{v.term}</span>
                      {v.alternatives && (
                        <span className="text-[10px] text-green-700 block font-medium mt-0.5">Use: {v.alternatives.join(", ")}</span>
                      )}
                    </div>
                  ))}
                  {(!voice?.bannedVocabulary || voice.bannedVocabulary.length === 0) && (
                    <div className="text-xs bg-red-50 text-red-800 border border-red-100 p-2 rounded">
                      <span className="line-through font-mono font-bold text-red-700">bag of vectors</span>
                      <span className="text-[10px] text-green-700 block font-medium mt-0.5">Use: embeddings</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Disclaimer block */}
            {(voice?.requiredDisclaimers || []).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">Required Disclaimers</h3>
                {(voice.requiredDisclaimers).map((disc: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-500 font-mono italic">
                    "{disc.text}"
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logo Constraint Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <ImageIcon className="text-indigo-600" size={18} />
              <h2 className="text-sm font-semibold text-gray-800">Logo Usage Restrictions</h2>
            </div>

            {assets.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                  <img
                    src={assets[0].url}
                    alt={assets[0].name}
                    className="max-h-16 object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Usage constraints:</h4>
                  <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                    {(assets[0].prohibitedUses || []).map((use: string, idx: number) => (
                      <li key={idx}>{use}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No assets loaded. Connect API server.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. MCP Assistant Integration Section */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-950 text-white rounded-xl p-6 border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="text-orange-400" size={24} />
          <h2 className="text-lg font-bold tracking-tight">AI Landing Page Generator &amp; MCP Integration</h2>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed mb-5">
          Using your AI Agent connected to the <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-orange-300">kyra-brand</code> MCP server, you can dynamically build, check, and optimize landing pages that comply perfectly with Husqvarna's design specifications. The MCP server bridges the AI directly to our Brand Core.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              1. Ground
            </div>
            <p className="text-xs text-gray-400">
              The agent runs <code className="bg-black/30 text-gray-200 px-1 py-0.5 font-mono">get_brand_context</code> before generating code to pull the required colors (Blue <code className="text-blue-300">#00468C</code>, Orange <code className="text-orange-300">#C45A00</code>) and vocabulary terms.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              2. Validate
            </div>
            <p className="text-xs text-gray-400">
              The agent calls <code className="bg-black/30 text-gray-200 px-1 py-0.5 font-mono">validate_artifact</code> on the generated landing page HTML to search for inline CSS styles or banned color hex values.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              3. Transform
            </div>
            <p className="text-xs text-gray-400">
              If any rules fail, the agent triggers <code className="bg-black/30 text-gray-200 px-1 py-0.5 font-mono">transform_artifact</code> with operations like <code className="text-green-300">recolor</code> or <code className="text-green-300">rewrite-voice</code> to auto-fix the layout.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Example prompt to build a landing page:</div>
          <div className="bg-black/50 border border-gray-800 rounded-lg p-3 text-xs font-mono text-green-400 select-all">
            "Generate a landing page for our new Husqvarna Chainsaws. Call the get_brand_context tool first to ground yourself in the brand rules. Do not use generic CSS colors, only use official Husqvarna colors, and validate the final layout with validate_artifact."
          </div>
        </div>
      </div>

      {/* 4. Interactive Brand compliance widget (Playground) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <Code className="text-blue-600" size={18} />
            <h2 className="text-sm font-semibold text-gray-800">Interactive Brand Compliance Playground</h2>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
            Live Compliance Engine
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Test layout or component code blocks live against the compliance engine. This matches the same checkers that run inside the MCP server.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input side */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Component Type</label>
              <div className="flex gap-2">
                {["Button", "Input", "Card"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPlaygroundComponent(c)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      playgroundComponent === c
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">JSX / HTML Code</label>
              <textarea
                value={playgroundCode}
                onChange={(e) => setPlaygroundCode(e.target.value)}
                rows={7}
                className="w-full bg-gray-950 text-green-400 font-mono text-xs rounded-xl p-4 border border-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={runPlaygroundScorecard}
              disabled={playgroundLoading || !playgroundCode.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {playgroundLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running check...
                </>
              ) : (
                "Validate Compliance Scorecard"
              )}
            </button>
          </div>

          {/* Result side */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-center min-h-[260px]">
            {playgroundError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="font-semibold">Compliance server error</strong>
                  <p className="text-red-600 mt-1">Make sure the Python compliance server task is running on port 8000.</p>
                </div>
              </div>
            )}

            {playgroundResult && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`text-3xl font-extrabold tabular-nums ${
                      playgroundResult.score >= 80 ? "text-green-600" : playgroundResult.score >= 50 ? "text-yellow-600" : "text-red-600"
                    }`}
                  >
                    {playgroundResult.score}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{playgroundResult.component} scorecard</h4>
                    <span className="text-[10px] text-gray-400">
                      {playgroundResult.checks.filter((c: any) => c.passed).length}/{playgroundResult.checks.length} validations passed
                    </span>
                  </div>

                  <div className="flex-1 ml-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          playgroundResult.score >= 80 ? "bg-green-500" : playgroundResult.score >= 50 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${playgroundResult.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {playgroundResult.checks.map((check: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-2 rounded text-xs ${
                        check.passed ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                      }`}
                    >
                      {check.passed ? (
                        <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span>{check.check}</span>
                    </div>
                  ))}
                </div>

                {playgroundResult.fixes && playgroundResult.fixes.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 mt-1">
                    <div className="text-[10px] font-bold text-gray-600 uppercase mb-1">Required Corrections:</div>
                    <div className="space-y-1">
                      {playgroundResult.fixes.map((fix: string, idx: number) => (
                        <div key={idx} className="text-[10px] text-gray-600 bg-white border border-gray-100 px-2 py-1 rounded font-mono">
                          → {fix}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!playgroundResult && !playgroundError && !playgroundLoading && (
              <div className="text-center text-gray-400 py-10">
                <FileCode className="mx-auto text-gray-300 mb-2" size={36} />
                <h4 className="text-xs font-bold text-gray-700">Ready to Validate</h4>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] mx-auto">
                  Click the button on the left to run validation checks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
