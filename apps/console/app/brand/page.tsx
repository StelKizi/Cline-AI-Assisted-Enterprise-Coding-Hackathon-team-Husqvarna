"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Palette,
  MessageSquare,
  Image,
  Copy,
  Check,
  RefreshCw,
  Layers,
  AlertTriangle,
  Shield,
} from "lucide-react";

const BRAND_ID = "00000000-0000-0000-0000-000000000001";
const API = "https://kyra-api-1047267022876.us-central1.run.app";

interface BrandSummary {
  id: string;
  name: string;
  description: string;
  tokenCount: number;
  componentCount: number;
  colors: string[];
  criticalRequirements: string[];
  policies: Array<{ area: string; rules: string[] }>;
  voice: {
    tone: string[];
    readingLevel: string;
    bannedTerms: Array<{ term: string; reason?: string }>;
    guidelines: string[];
  };
  assets: Array<{ id: string; name: string; type: string }>;
  createdAt: string;
  updatedAt: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded hover:bg-gray-200 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-400" />}
    </button>
  );
}

export default function BrandPage() {
  const [brand, setBrand] = useState<BrandSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/brands/${BRAND_ID}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setBrand(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load brand");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-10 text-gray-400">Loading brand…</div>;
  if (error) return (
    <div className="p-10">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-medium">Failed to load brand</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={load} className="mt-3 text-sm underline">Retry</button>
      </div>
    </div>
  );
  if (!brand) return null;

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={24} /> {brand.name}
          </h1>
          <p className="text-gray-500 mt-1 max-w-xl">{brand.description}</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Refresh">
          <RefreshCw size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Brand ID */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Brand ID</div>
          <code className="text-sm text-gray-700 font-mono">{brand.id}</code>
        </div>
        <CopyButton text={brand.id} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Colors", value: brand.colors.length, Icon: Palette },
          { label: "Token Categories", value: brand.tokenCount, Icon: Layers },
          { label: "Components", value: brand.componentCount, Icon: Layers },
          { label: "Policies", value: (brand.policies?.length || 0), Icon: Shield },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><s.Icon size={14} /> <span className="text-xs uppercase tracking-wide">{s.label}</span></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Critical Requirements */}
      {brand.criticalRequirements && brand.criticalRequirements.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2 mb-4">
            <AlertTriangle size={18} /> Critical Requirements
          </h2>
          <div className="space-y-2">
            {brand.criticalRequirements.map((req, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/70 rounded-lg px-4 py-3 border border-amber-100">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                <span className="text-sm text-amber-900">{req}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Policies by Area */}
      {brand.policies && brand.policies.length > 0 && (
        <section className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Shield size={18} /> Component & Token Policies
          </h2>
          <div className="space-y-4">
            {brand.policies.map((policy) => (
              <div key={policy.area} className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">{policy.area}</h3>
                <ul className="space-y-1.5">
                  {policy.rules.map((rule, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Color Palette */}
      <section className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Palette size={18} /> Approved Color Palette
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
          {brand.colors.map((hex) => (
            <div key={hex} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: hex }} />
              <div className="flex items-center gap-1">
                <code className="text-[11px] text-gray-500 font-mono">{hex}</code>
                <CopyButton text={hex} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Voice & Guidelines */}
      <section className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <MessageSquare size={18} /> Voice & Guidelines
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tone</h3>
            <div className="flex flex-wrap gap-2">
              {brand.voice.tone.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium capitalize">{t}</span>
              ))}
            </div>
            <div className="mt-4">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Reading Level</span>
              <div className="text-sm font-medium text-gray-900 mt-0.5">{brand.voice.readingLevel}</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Brand Guidelines</h3>
            <ul className="space-y-1.5">
              {brand.voice.guidelines.map((g, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Banned Terms */}
      {brand.voice.bannedTerms.length > 0 && (
        <section className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Banned Vocabulary</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {brand.voice.bannedTerms.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2">
                <span className="text-red-500 text-xs">✕</span>
                <code className="text-sm text-red-700 font-mono">{t.term}</code>
                {t.reason && <span className="text-[11px] text-red-400 ml-auto truncate max-w-[140px]" title={t.reason}>{t.reason}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Assets */}
      <section className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Image size={18} /> Brand Assets
        </h2>
        <div className="divide-y">
          {brand.assets.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{a.name}</div>
                <div className="text-xs text-gray-400 capitalize">{a.type}</div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{a.id}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MCP Server info */}
      <section className="bg-gray-900 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">MCP Server</h2>
        <p className="text-gray-400 text-sm mb-3">Use this brand ID with any MCP tool. Pass it as the <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">brand_id</code> parameter.</p>
        <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
          <span className="text-green-400">{brand.id}</span>
          <CopyButton text={brand.id} />
        </div>
      </section>
    </div>
  );
}
