// ─── Kyra API Server ────────────────────────────────────────────────
// REST API: the load-bearing interface. Everything else wraps this.

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validateRoute } from "./routes/validate.js";
import { transformRoute } from "./routes/transform.js";
import { groundRoute } from "./routes/ground.js";
import { brandsRoute } from "./routes/brands.js";
import { metering } from "./middleware/metering.js";
import { auth } from "./middleware/auth.js";

const app = new Hono();

// ─── Global middleware ──────────────────────────────────────────────
app.use("*", logger());
app.use("*", cors());

// ─── Health ─────────────────────────────────────────────────────────
app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

// ─── API v1 ─────────────────────────────────────────────────────────
const v1 = new Hono();
v1.use("*", auth);
v1.use("*", metering);

v1.route("/validate", validateRoute);
v1.route("/transform", transformRoute);
v1.route("/ground", groundRoute);
v1.route("/brands", brandsRoute);

app.route("/api/v1", v1);

// ─── Start ──────────────────────────────────────────────────────────
const port = parseInt(process.env.PORT || "3737");

serve({ fetch: app.fetch, port }, () => {
  console.log(`Kyra API running on http://localhost:${port}`);
});
