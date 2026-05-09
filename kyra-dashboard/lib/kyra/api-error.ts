export function extractApiError(data: unknown, status: number, fallback: string): string {
  if (data && typeof data === "object" && "error" in data && typeof (data as Record<string, unknown>).error === "string") {
    return (data as Record<string, string>).error;
  }
  return `HTTP ${status}` || fallback;
}
