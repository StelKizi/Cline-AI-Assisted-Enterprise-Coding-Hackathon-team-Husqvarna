"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { BRAND_ID } from "../api";

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
  fixes?: string[];
}

export default function CompliancePage() {
  const [component, setComponent] = useState("Button");
  const [code, setCode] = useState(
    `<Button variant="primary">Submit</Button>`
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
        body: JSON.stringify({ component_name: component, code, brand: BRAND_ID }),
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
          Validate component code against the brand design system spec
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
            Make sure the Python Compliance API is running on localhost:8000 (cd kyra-mcp && uv run python api.py)
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
              {result.score}%
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Compliance Score — {result.component}
              </p>
              <p className="text-xs text-gray-500">
                {result.score >= 80 ? "Passes brand contract" : "Requires fixes to meet brand guidelines"}
              </p>
            </div>
          </div>

          {/* Checks list */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            {result.checks.map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                {c.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={c.passed ? "text-gray-800" : "text-red-700 font-medium"}>
                    {c.check}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {result.fixes && result.fixes.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Required Fixes</p>
              <ul className="space-y-1">
                {result.fixes.map((fix, idx) => (
                  <li key={idx} className="text-xs text-red-600 font-mono">
                    → {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
