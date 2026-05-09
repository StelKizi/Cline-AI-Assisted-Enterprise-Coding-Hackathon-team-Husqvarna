import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { loadComponents, loadTokens } from "@/lib/kyra/data";
import { readGeneratedRecord, writeGeneratedRecord } from "@/lib/kyra/generated-store";
import type { GeneratedRecord } from "@/lib/kyra/generated-types";
import { resolveSize, resolveVariant } from "@/lib/kyra/jsx-meta";
import { generateWithOpenAI } from "@/lib/kyra/openai-generate";
import { buildPreviewDocument, buildStubPreviewBody, wrapPageShell } from "@/lib/kyra/preview-html";
import { safeDisplayTitle, shortPageTitle, wantsSignupLikeLayout } from "@/lib/kyra/safe-text";
import { inferComponentName, inferWantsPage } from "@/lib/kyra/infer-from-prompt";
import { buildPreviewInnerFromKyraJsx } from "@/lib/kyra/jsx-to-preview-html";
import { generateStubPage } from "@/lib/kyra/stub-generate";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const prompt = typeof b.prompt === "string" ? b.prompt : "";
  const updateSlugRaw =
    typeof b.update_slug === "string"
      ? b.update_slug.trim()
      : typeof b.updateSlug === "string"
        ? b.updateSlug.trim()
        : "";

  let existing: GeneratedRecord | null = null;
  if (updateSlugRaw) {
    existing = await readGeneratedRecord(updateSlugRaw);
    if (!existing) {
      return NextResponse.json({ error: "update_slug not found", slug: updateSlugRaw }, { status: 404 });
    }
  }

  const componentNameFromBody =
    typeof b.component_name === "string" ? b.component_name.trim() : "";
  const wantsPageExplicit = b.wants_page ?? b.wantsPage;

  if (!prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const mergedPrompt = existing
    ? `${existing.prompt}\n\n--- Revision ---\n${prompt.trim()}`
    : prompt.trim();
  const stubPrompt = mergedPrompt;
  const openAiPrompt = existing ? prompt.trim() : mergedPrompt;

  try {
    const components = await loadComponents();
    const availableNames = Object.keys(components);

    const inferredFromLatestLine = prompt.trim();
    const componentName =
      componentNameFromBody ||
      (existing ? existing.componentName : "") ||
      inferComponentName(inferredFromLatestLine, availableNames);

    const wantsPage =
      typeof wantsPageExplicit === "boolean"
        ? wantsPageExplicit
        : existing
          ? existing.wantsPage
          : inferWantsPage(inferredFromLatestLine);

    const resolved = {
      componentName,
      wantsPage,
      componentInferred: !componentNameFromBody && !existing,
      wantsPageInferred: typeof wantsPageExplicit !== "boolean" && !existing,
    };

    const spec = components[componentName];
    if (!spec) {
      return NextResponse.json(
        {
          error: "component_not_found",
          component: componentName,
          available: Object.keys(components),
        },
        { status: 404 },
      );
    }

    const tokens = await loadTokens();

    let jsx: string;
    let source: GeneratedRecord["source"] = "stub";
    let warning: string | undefined;
    /** When stub runs, reuse its preview HTML so iframe matches multi-block JSX (signup layout). */
    let stubPreviewHtml: string | undefined;

    try {
      const ai = await generateWithOpenAI({
        prompt: openAiPrompt,
        auditIntent: mergedPrompt,
        previousJsx: existing?.jsx,
        componentName,
        wantsPage,
        spec,
        tokens,
      });
      if (ai) {
        jsx = ai.jsx;
        source = "openai";
      } else {
        const stub = generateStubPage({
          prompt: stubPrompt,
          componentName,
          wantsPage,
          spec,
          tokens,
        });
        jsx = stub.jsx;
        source = "stub";
        stubPreviewHtml = stub.previewHtml;
      }
    } catch (e) {
      const stub = generateStubPage({
        prompt: stubPrompt,
        componentName,
        wantsPage,
        spec,
        tokens,
      });
      jsx = stub.jsx;
      source = "stub";
      stubPreviewHtml = stub.previewHtml;
      warning =
        e instanceof Error
          ? `Generation fell back to template (${e.message})`
          : "Generation fell back to template";
    }

    const variant = resolveVariant(jsx, spec, componentName);
    const size = resolveSize(jsx, spec, componentName);
    const title = safeDisplayTitle(mergedPrompt);
    const pageHeading = shortPageTitle(mergedPrompt);
    const signupPreview =
      wantsPage &&
      wantsSignupLikeLayout(mergedPrompt) &&
      ["Button", "Input", "Card"].includes(componentName);

    const openAiPreviewInner = source === "openai" ? buildPreviewInnerFromKyraJsx(jsx, title) : null;

    const previewHtml =
      source === "stub" && stubPreviewHtml
        ? stubPreviewHtml
        : openAiPreviewInner
          ? buildPreviewDocument(
              tokens,
              wantsPage
                ? wrapPageShell(openAiPreviewInner)
                : `<main class="preview-main-flow">${openAiPreviewInner}</main>`,
            )
          : buildPreviewDocument(
              tokens,
              buildStubPreviewBody({
                title,
                componentName,
                wantsPage,
                variant,
                size,
                ...(wantsPage ? { pageTitle: pageHeading } : {}),
                ...(signupPreview ? { layout: "signup" as const } : {}),
              }),
            );

    const slug = existing ? existing.slug : `gen-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
    const record: GeneratedRecord = {
      slug,
      prompt: mergedPrompt,
      componentName,
      wantsPage,
      jsx,
      previewHtml,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      source,
    };

    await writeGeneratedRecord(record);

    return NextResponse.json({
      slug,
      previewPath: `/preview/${slug}`,
      componentName,
      source,
      record,
      resolved,
      updated: Boolean(existing),
      ...(warning ? { warning } : {}),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
