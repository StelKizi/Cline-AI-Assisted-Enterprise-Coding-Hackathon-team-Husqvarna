// ─── Figma Plugin: Code (sandbox) ───────────────────────────────────
// Runs in Figma's sandbox. Reads the canvas, sends to Brand Core API,
// displays results in the UI panel. No state — thin client.

const API_BASE = "http://localhost:3737/api/v1"; // configurable

figma.showUI(__html__, { width: 320, height: 480 });

// ─── Listen for messages from UI ────────────────────────────────────

figma.ui.onmessage = async (msg: { type: string; [key: string]: unknown }) => {
  switch (msg.type) {
    case "validate":
      await handleValidate();
      break;
    case "fix":
      await handleFix(msg.violationId as string);
      break;
    case "fix-all":
      await handleFixAll();
      break;
  }
};

// ─── Validate current selection ─────────────────────────────────────

async function handleValidate() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "error", message: "Select something first" });
    return;
  }

  // Extract artifact data from selection
  const artifact = await extractArtifact(selection);

  figma.ui.postMessage({ type: "validating" });

  try {
    const response = await fetch(`${API_BASE}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId: "configured-brand-id", // TODO: from plugin settings
        artifact,
      }),
    });

    const result = await response.json();
    figma.ui.postMessage({ type: "validation-result", data: result });
  } catch (err) {
    figma.ui.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "Validation failed",
    });
  }
}

// ─── Fix a single violation ─────────────────────────────────────────

async function handleFix(violationId: string) {
  // TODO: Call /transform for the specific violation
  figma.ui.postMessage({ type: "fix-applied", violationId });
}

async function handleFixAll() {
  // TODO: Call /transform with auto-fix-violations
  figma.ui.postMessage({ type: "all-fixes-applied" });
}

// ─── Extract artifact from Figma selection ──────────────────────────

async function extractArtifact(nodes: readonly SceneNode[]) {
  const colors: string[] = [];
  const texts: string[] = [];

  for (const node of nodes) {
    // Collect colors
    if ("fills" in node && Array.isArray(node.fills)) {
      for (const fill of node.fills as Paint[]) {
        if (fill.type === "SOLID" && fill.visible !== false) {
          const { r, g, b } = fill.color;
          const hex = `#${[r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("")}`;
          colors.push(hex);
        }
      }
    }

    // Collect text
    if (node.type === "TEXT") {
      texts.push(node.characters);
    }
  }

  return {
    type: "raw" as const,
    content: JSON.stringify({ colors, texts }),
    metadata: {
      source: "figma",
      nodeCount: nodes.length,
    },
  };
}
