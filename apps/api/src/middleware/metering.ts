// ─── Metering Middleware ─────────────────────────────────────────────
// Track API calls per brand for usage-based billing.
// Observable from day one — architecture and pricing constrain each other.

import type { MiddlewareHandler } from "hono";

interface MeterEntry {
  brandId: string;
  endpoint: string;
  timestamp: string;
  durationMs: number;
}

// In-memory for now. Replace with Redis/Kafka in production.
const meterLog: MeterEntry[] = [];

export const metering: MiddlewareHandler = async (c, next) => {
  const start = Date.now();

  await next();

  const entry: MeterEntry = {
    brandId: c.req.header("X-Brand-Id") || "unknown",
    endpoint: `${c.req.method} ${c.req.path}`,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - start,
  };

  meterLog.push(entry);

  // Expose metering headers
  c.header("X-Kyra-Request-Duration", String(entry.durationMs));
};

export function getMeterLog(): MeterEntry[] {
  return meterLog;
}
