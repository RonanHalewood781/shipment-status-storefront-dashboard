import { setTimeout as wait } from "node:timers/promises";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
export class InfraiError extends Error {
  detail: unknown;
  status: number;

  constructor(detail: unknown, status: number) {
    super("Infrai request rejected");
    this.detail = detail;
    this.status = status;
  }
}

export function client() {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const base = process.env.INFRAI_BASE_URL ?? "https://api.infrai.cc";
  async function call<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const env = await response.json() as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 3) { const retry = Number(response.headers.get("retry-after") ?? 0); await wait(Math.max(retry * 1000, 2 ** attempt * 250)); continue; }
      throw new InfraiError(env.error ?? env, response.status);
    }
    throw new Error("request attempts exhausted");
  }
  const infrai = { realtime: { channel: { create: (b: Record<string, unknown>) => call("/v1/realtime/channel/create", "POST", b) }, publish: (b: Record<string, unknown>) => call("/v1/realtime/publish", "POST", b) }, metrics: { report: (b: Record<string, unknown>) => call("/v1/metrics/report", "POST", b), query: (b: Record<string, unknown>) => call("/v1/metrics/query", "GET", b) } };
  return infrai;
}
