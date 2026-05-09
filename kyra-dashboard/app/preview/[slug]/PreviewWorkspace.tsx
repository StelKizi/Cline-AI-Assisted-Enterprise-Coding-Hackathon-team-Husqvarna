"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ErrorBox } from "@/components/ErrorBox";
import { Spinner } from "@/components/Spinner";
import { extractApiError } from "@/lib/kyra/api-error";
import type { ScorecardResult } from "@/lib/kyra/types";

type GeneratedRecord = {
  slug: string;
  prompt: string;
  componentName: string;
  wantsPage: boolean;
  jsx: string;
  previewHtml: string;
  createdAt: string;
  source: "stub" | "openai";
};

type BundleItem = { component: string; result: ScorecardResult };

type BundleResponse = {
  mode: "bundle";
  overall: "PASS" | "FAIL";
  components: string[];
  items: BundleItem[];
  totalPassed: number;
  totalChecks: number;
  message?: string;
};

export function PreviewWorkspace({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const warnBanner = searchParams.get("warn");

  const [record, setRecord] = useState<GeneratedRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bundle, setBundle] = useState<BundleResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const [reviseText, setReviseText] = useState("");
  const [reviseBusy, setReviseBusy] = useState(false);
  const [reviseError, setReviseError] = useState<string | null>(null);
  /** Bumps when preview HTML changes so the iframe reliably picks up a new srcDoc. */
  const [iframeNonce, setIframeNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const res = await fetch(`/api/kyra/generated/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(extractApiError(data, res.status, "Failed to load preview"));
        if (!cancelled) setRecord(data as GeneratedRecord);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load preview");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const runCompliance = useCallback(async () => {
    if (!record) return;
    setBusy(true);
    setScoreError(null);
    setBundle(null);
    try {
      const res = await fetch("/api/kyra/compliance-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: record.jsx, scope: "all" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data, res.status, "Compliance check failed"));
      if (data.mode !== "bundle") {
        throw new Error("Expected bundle compliance response");
      }
      setResultKey((k) => k + 1);
      setBundle(data as BundleResponse);
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : "Compliance check failed");
    } finally {
      setBusy(false);
    }
  }, [record]);

  async function onRevise(e: React.FormEvent) {
    e.preventDefault();
    if (!record || !reviseText.trim()) return;
    setReviseBusy(true);
    setReviseError(null);
    try {
      const res = await fetch("/api/kyra/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          update_slug: record.slug,
          prompt: reviseText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data, res.status, "Revision failed"));
      const next = data?.record as GeneratedRecord | undefined;
      if (!next?.previewHtml) {
        throw new Error("Missing record in response");
      }
      setRecord(next);
      setIframeNonce((n) => n + 1);
      setReviseText("");
      setBundle(null);
    } catch (err) {
      setReviseError(err instanceof Error ? err.message : "Revision failed");
    } finally {
      setReviseBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-600 text-sm">{loadError}</p>
        <Link href="/studio" className="text-sm underline text-gray-700">
          Back to studio
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading preview…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {warnBanner ? (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-950">
          {warnBanner}
        </div>
      ) : null}

      <header className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/studio"
            className="text-sm font-medium text-gray-700 hover:text-black shrink-0"
          >
            ← Studio
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">Preview · {record.slug}</h1>
            <p className="text-xs text-gray-500 truncate">{record.prompt}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {record.componentName} · {record.source}
          {record.wantsPage ? " · page" : " · fragment"}
        </span>
      </header>

      <div className="flex-1 flex min-h-0">
        <section className="flex-1 min-w-0 flex flex-col p-4 gap-3">
          <div className="flex-1 min-h-0 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <iframe
              key={iframeNonce}
              title="Generated preview"
              className="w-full h-full min-h-[480px] border-0"
              sandbox="allow-same-origin"
              srcDoc={record.previewHtml}
            />
          </div>
          <details className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium text-gray-800">Source JSX (compliance input)</summary>
            <pre className="mt-2 max-h-48 overflow-auto text-xs bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
              {record.jsx}
            </pre>
          </details>
          <p className="text-xs text-gray-500">
            Binary assets stay in Kyra MCP (<code className="bg-gray-100 px-1 rounded">read_asset</code>).
            This preview uses only <code className="bg-gray-100 px-1 rounded">tokens.json</code> for styling.
            {record.source === "openai" ? (
              <>
                {" "}
                OpenAI runs: the iframe follows your JSX by mapping Kyra tags (and simple{" "}
                <code className="bg-gray-100 px-1 rounded">section</code> / headings) to static HTML—add a block in
                JSX and it should show after regenerate/revise.
              </>
            ) : null}
          </p>
        </section>

        <aside className="w-full max-w-md shrink-0 border-l border-gray-200 bg-white p-4 flex flex-col gap-3 overflow-y-auto">
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-2">
            <h2 className="text-sm font-semibold text-gray-900">Revise in place</h2>
            <p className="text-xs text-gray-600">
              Same preview URL: updates JSON on disk and refreshes the iframe only—no full browser navigation.
            </p>
            <form onSubmit={onRevise} className="space-y-2">
              <textarea
                value={reviseText}
                onChange={(e) => setReviseText(e.target.value)}
                rows={3}
                placeholder='e.g. "Change the primary button to variant ghost"'
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {reviseError ? <ErrorBox message={reviseError} /> : null}
              <button
                type="submit"
                disabled={reviseBusy || !reviseText.trim()}
                className="w-full py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-black disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {reviseBusy ? (
                  <>
                    <Spinner size="sm" />
                    Applying…
                  </>
                ) : (
                  "Apply revision"
                )}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">Compliance</h2>
            <p className="text-xs text-gray-500 mt-1">
              Runs Kyra rules for <strong>every</strong> design-system component tag found in the generated JSX
              (same checks as MCP <code className="bg-gray-50 px-1 rounded">run_compliance_scorecard</code>, once per
              component type).
            </p>
          </div>

          <button
            type="button"
            onClick={runCompliance}
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <Spinner />
                Running…
              </>
            ) : (
              "Run compliance (all components)"
            )}
          </button>

          {scoreError && <ErrorBox message={scoreError} />}

          {bundle && (
            <div key={resultKey} className="space-y-3 animate-scale-in">
              <div
                className={`rounded-lg border-2 px-3 py-2 flex items-center justify-between ${
                  bundle.overall === "PASS"
                    ? "border-green-400 bg-green-50"
                    : "border-red-400 bg-red-50"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    bundle.overall === "PASS" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  Overall {bundle.overall}
                </span>
                <span className="text-xs text-gray-600">
                  {bundle.totalPassed}/{bundle.totalChecks} checks · {bundle.components.length} component
                  {bundle.components.length === 1 ? "" : "s"}
                </span>
              </div>

              {bundle.message ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                  {bundle.message}
                </p>
              ) : null}

              {bundle.items.map(({ component, result }) => (
                <div
                  key={component}
                  className={`rounded-xl border p-3 space-y-2 ${
                    result.status === "PASS"
                      ? "border-green-200 bg-green-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-900">&lt;{component}&gt;</span>
                    <span
                      className={`text-xs font-bold ${
                        result.status === "PASS" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {result.checks.map((check, i) => {
                      const pass = check.startsWith("✓");
                      return (
                        <li
                          key={i}
                          className={`text-[11px] leading-snug rounded px-1.5 py-0.5 ${
                            pass ? "text-green-900" : "text-red-900"
                          }`}
                        >
                          {check}
                        </li>
                      );
                    })}
                  </ul>
                  {result.fixes.length > 0 && (
                    <ul className="text-[11px] text-gray-800 space-y-0.5 pt-1 border-t border-gray-200/80">
                      {result.fixes.map((fix, i) => (
                        <li key={i} className="flex gap-1">
                          <span className="text-gray-400 shrink-0">→</span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
