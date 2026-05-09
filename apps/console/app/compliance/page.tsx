"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// ─── Compliance Scorecard ───────────────────────────────────────────
// Ported from Mark's kyra-dashboard — runs component code against the
// design-system compliance engine (Python FastMCP → FastAPI on :8000).

const COMPONENTS = ["Button", "Input", "Card"];

interface CheckResult {
  check: string;
  passed: boolean;
  details: string;
}

interface ScorecardResult {
  component: string;
  score: number;
  checks: CheckResult[];
}

export default function CompliancePage() {
  const [component, setComponent] = useState("Button");
  const [code, setCode] = useState(
    `<button className="bg-blue-500 text-white px-4 py-2 rounded-md">\n  Click me\n</button>`
  );
  const [result, setResult] = useState<ScorecardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data: ScorecardResult = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Compliance Scorecard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Validate component code against the design system spec
        </p>
      </div>

      {/* Input form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 animate-fade-in">
        <label className="block text-sm font-medium text-gray-700 mb-2">Component</label>
        <div className="flex gap-2 mb-4">
          {COMPONENTS.map((c) => (
            <button
              key={c}
              onClick={() => setComponent(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                component === c
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">Code to validate</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={6}
          className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-lg p-4 border-0 focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="Paste your component JSX here..."
        />

        <button
          onClick={runScorecard}
          disabled={loading || !code.trim()}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Running..." : "Run Scorecard"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm animate-fade-in">
          <strong>Error:</strong> {error}
          <p className="text-red-500 mt-1 text-xs">
            Make sure the MCP API is running on localhost:8000
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-scale-in">
          {/* Score header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`text-4xl font-bold tabular-nums ${
                result.score >= 80
                  ? "text-green-600"
                  : result.score >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {result.score}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700">{result.component}</div>
              <div className="text-xs text-gray-500">
                {result.checks.filter((c) => c.passed).length}/{result.checks.length} checks passed
              </div>
            </div>
            {/* Score bar */}
            <div className="flex-1 ml-4">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full animate-bar-fill ${
                    result.score >= 80
                      ? "bg-green-500"
                      : result.score >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checks list */}
          <div className="space-y-3">
            {result.checks.map((check, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  check.passed ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {check.passed ? <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />}
                <div>
                  <div
                    className={`text-sm font-medium ${
                      check.passed ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {check.check}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      check.passed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {check.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
