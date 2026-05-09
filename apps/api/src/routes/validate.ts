// ─── /validate ──────────────────────────────────────────────────────
// Send an artifact, get back a structured violation report.

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuid } from "uuid";
import { ValidateRequest, ValidateResponse, type Violation } from "@kyra/brand-core";
import { runCheckers } from "../engine/checker-pipeline.js";

export const validateRoute = new Hono();

validateRoute.post("/", zValidator("json", ValidateRequest), async (c) => {
  const req = c.req.valid("json");

  // Run the checker pipeline
  const violations = await runCheckers(req);

  // Score: 100 minus weighted penalties
  const score = Math.max(
    0,
    100 -
      violations.reduce((acc, v) => {
        const weight = v.severity === "error" ? 15 : v.severity === "warning" ? 5 : 1;
        return acc + weight * v.confidence;
      }, 0)
  );

  const response: ValidateResponse = {
    brandId: req.brandId,
    score: Math.round(score),
    violations,
    checksRun: req.checks || ["color", "typography", "voice", "vocabulary", "composition", "logo", "disclaimer"],
    timestamp: new Date().toISOString(),
    auditId: uuid(),
  };

  // TODO: Write audit log entry

  return c.json(response);
});
