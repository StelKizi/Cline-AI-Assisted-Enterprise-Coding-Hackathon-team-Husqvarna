"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorBox } from "@/components/ErrorBox";
import { KyraHeader } from "@/components/KyraHeader";
import { Spinner } from "@/components/Spinner";
import { extractApiError } from "@/lib/kyra/api-error";

export default function StudioPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(
    "Landing signup page: email input, terms checkbox, primary submit button, and a sign-in link. Full page.",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/kyra/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data, res.status, "Generation failed"));
      const slug = data?.slug as string | undefined;
      if (!slug) throw new Error("Missing slug in response");
      const warn =
        typeof data?.warning === "string" ? (data.warning as string) : undefined;
      const q = warn ? `?warn=${encodeURIComponent(warn)}` : "";
      router.push(`/preview/${encodeURIComponent(slug)}${q}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KyraHeader
        title="Kyra Studio"
        subtitle="Prompt-only · component and layout inferred on the server"
        navLinks={[{ href: "/", label: "Scorecard lab" }]}
      />

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Describe the UI in natural language. The API picks a <strong>focus component</strong> and whether you
            want a <strong>full page</strong> or a <strong>single-component snippet</strong> from wording (e.g.
            &quot;only a submit button&quot; → fragment). Optional overrides:{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">component_name</code>,{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">wants_page</code> in JSON if you call the API
            directly.
          </p>

          <form onSubmit={onGenerate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="prompt" className="text-sm font-medium text-gray-800">
                Prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Example: Card with pricing and a primary Button…"
                required
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={busy || !prompt.trim()}
              className="w-full py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Spinner />
                  Generating…
                </>
              ) : (
                "Create page (new route)"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500">
            Optional: set <code className="bg-gray-100 px-1 rounded">OPENAI_API_KEY</code> and, if needed,{" "}
            <code className="bg-gray-100 px-1 rounded">OPENAI_MODEL</code> — otherwise a deterministic template
            is used from the contract in{" "}
            <code className="bg-gray-100 px-1 rounded">components.json</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
