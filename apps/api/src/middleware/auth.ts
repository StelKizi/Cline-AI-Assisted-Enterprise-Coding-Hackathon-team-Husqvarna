// ─── Auth Middleware ─────────────────────────────────────────────────
// API key validation. OAuth/JWT comes later for multi-tenant.

import type { MiddlewareHandler } from "hono";

export const auth: MiddlewareHandler = async (c, next) => {
  const apiKey = c.req.header("X-API-Key") || c.req.header("Authorization")?.replace("Bearer ", "");

  if (!apiKey) {
    return c.json({ error: "Missing API key" }, 401);
  }

  // TODO: Look up API key in database, resolve to org/brand
  // For now, pass through for development
  c.set("apiKey", apiKey);

  await next();
};
