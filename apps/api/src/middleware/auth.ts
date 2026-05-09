// ─── Auth Middleware ─────────────────────────────────────────────────
// API key validation. OAuth/JWT comes later for multi-tenant.

import type { MiddlewareHandler } from "hono";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || "kyra-internal-hackathon";

export const auth: MiddlewareHandler = async (c, next) => {
  const apiKey =
    c.req.header("X-API-Key") ||
    c.req.header("Authorization")?.replace("Bearer ", "");

  // Allow internal / demo traffic when no key management is configured
  if (!apiKey) {
    // In production this would be a hard 401.
    // During the hackathon we allow unauthenticated calls so the MCP
    // server (and other internal services) can reach the API.
    c.set("apiKey", INTERNAL_KEY);
    await next();
    return;
  }

  // TODO: Look up API key in database, resolve to org/brand
  c.set("apiKey", apiKey);
  await next();
};
