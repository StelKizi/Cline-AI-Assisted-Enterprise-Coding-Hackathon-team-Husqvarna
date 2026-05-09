// ─── Brand management routes ────────────────────────────────────────

import { Hono } from "hono";

export const brandsRoute = new Hono();

// GET /brands/:id — get brand state summary
brandsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  // TODO: Fetch from storage
  return c.json({ id, message: "Not yet implemented" }, 501);
});

// GET /brands/:id/tokens — get current token set
brandsRoute.get("/:id/tokens", async (c) => {
  const id = c.req.param("id");
  return c.json({ brandId: id, message: "Not yet implemented" }, 501);
});

// GET /brands/:id/voice — get current voice rules
brandsRoute.get("/:id/voice", async (c) => {
  const id = c.req.param("id");
  return c.json({ brandId: id, message: "Not yet implemented" }, 501);
});

// GET /brands/:id/assets — list assets
brandsRoute.get("/:id/assets", async (c) => {
  const id = c.req.param("id");
  return c.json({ brandId: id, assets: [], message: "Not yet implemented" }, 501);
});

// GET /brands/:id/audit — get audit log
brandsRoute.get("/:id/audit", async (c) => {
  const id = c.req.param("id");
  return c.json({ brandId: id, entries: [], message: "Not yet implemented" }, 501);
});
