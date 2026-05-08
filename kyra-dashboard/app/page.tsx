"use client";

import { useState } from "react";

const COMPONENTS = ["Button", "Input", "Card"];

const EXAMPLES = {
  bad: `<button style="background:#FF5733; padding:10px">Sign up</button>`,
  good: `<Button variant="primary" size="md">Sign up</Button>`,
};

type ScorecardResult = {
  status: "PASS" | "FAIL";
  passed: number;
  total: number;
  checks: string[];
  fixes: string[];
};

export default function Home() {
  const [component, setComponent] = useState("Button");
  const [code, setCode] = useState(EXAMPLES.bad);
  const [result, setResult] = useState<ScorecardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0);

  async function runScorecard() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/compliance-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ component_name: component, code }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResultKey((k) => k + 1);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 animate-fade-in">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">K</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Kyra</h1>
          <p className="text-xs text-gray-500">Design System Compliance</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Component selector */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: "60ms" }}>
          <label className="text-sm font-medium text-gray-700">Component</label>
          <div className="flex gap-2">
            {COMPONENTS.map((c) => (
              <button
                key={c}
                onClick={() => setComponent(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
                  component === c
                    ? "bg-black text-white border-black scale-105 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:shadow-sm"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Quick examples */}
        <div className="flex gap-2 animate-fade-in" style={{ animationDelay: "120ms" }}>
          <button
            onClick={() => { setCode(EXAMPLES.bad); setResult(null); }}
            className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-150"
          >
            Load bad example
          </button>
          <button
            onClick={() => { setCode(EXAMPLES.good); setResult(null); }}
            className="text-xs px-3 py-1 rounded border border-green-200 text-green-600 hover:bg-green-50 active:scale-95 transition-all duration-150"
          >
            Load good example
          </button>
        </div>

        {/* Code input */}
        <div className="space-y-1 animate-fade-in" style={{ animationDelay: "180ms" }}>
          <label className="text-sm font-medium text-gray-700">Generated code to validate</label>
          <textarea
            value={code}
            onChange={(e) => { setCode(e.target.value); setResult(null); }}
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none transition-shadow duration-200"
            placeholder="Paste generated JSX/HTML here..."
          />
        </div>

        {/* Run button */}
        <button
          onClick={runScorecard}
          disabled={loading || !code.trim()}
          className="w-full py-3 rounded-lg bg-black text-white font-medium text-sm hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 animate-fade-in flex items-center justify-center gap-2 animate-pulse-border"
          style={{ animationDelay: "240ms" }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running scorecard...
            </>
          ) : (
            "Run Compliance Scorecard"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
            {error}. Make sure Kyra API is running on port 8000.
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            key={resultKey}
            className={`rounded-xl border-2 p-6 space-y-4 animate-scale-in ${
              result.status === "PASS"
                ? "border-green-400 bg-green-50"
                : "border-red-400 bg-red-50"
            }`}
          >
            {/* Status header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${
                  result.status === "PASS" ? "text-green-700" : "text-red-700"
                }`}>
                  {result.status}
                </span>
                <span className="text-sm text-gray-600">
                  {result.passed}/{result.total} checks passed
                </span>
              </div>
              {/* Animated score bars */}
              <div className="flex gap-1 overflow-hidden">
                {Array.from({ length: result.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-2 rounded-full animate-bar-fill ${
                      i < result.passed ? "bg-green-500" : "bg-red-400"
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* Checks with stagger */}
            <div className="space-y-2 stagger">
              {result.checks.map((check, i) => {
                const pass = check.startsWith("✓");
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 animate-slide-in ${
                      pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span className="mt-0.5 font-bold">{pass ? "✓" : "✗"}</span>
                    <span>{check.slice(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Fixes with stagger */}
            {result.fixes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Required fixes:</p>
                <div className="space-y-2 stagger">
                  {result.fixes.map((fix, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200 animate-slide-in"
                      style={{ "--i": i + result.checks.length } as React.CSSProperties}
                    >
                      <span className="text-gray-400">→</span>
                      <span>{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
