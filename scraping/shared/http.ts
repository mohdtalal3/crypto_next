import "server-only";

import { Agent, ProxyAgent, fetch } from "undici";
import { decryptAurum, encryptAurum } from "@/scraping/shared/crypto";

export class AurumUnauthorizedError extends Error {}

const attempts = 3;
const resets = 3;
const agents = new Map<string, Agent | ProxyAgent>();

function agent(origin: string) {
  const existing = agents.get(origin);
  if (existing) return existing;
  const proxy = process.env.PROXY;
  const fresh = proxy ? new ProxyAgent(proxy) : new Agent();
  agents.set(origin, fresh);
  return fresh;
}

async function resetAgent(origin: string) {
  const old = agents.get(origin);
  agents.delete(origin);
  if (old) await old.close();
  return agent(origin);
}

async function request(token: string, url: string, origin: string, method: "GET" | "POST", payload?: Record<string, unknown>) {
  let lastError: unknown;
  for (let reset = 0; reset <= resets; reset += 1) {
    const dispatcher = reset === 0 ? agent(origin) : await resetAgent(origin);
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const response = await fetch(url, {
          method,
          dispatcher,
          signal: AbortSignal.timeout(30_000),
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${token}`,
            origin,
            referer: `${origin}/`,
            "x-requested-with": "aurum-with",
            ...(method === "POST" ? { "content-type": "application/json" } : {}),
          },
          ...(method === "POST" ? { body: JSON.stringify({ encrypted: encryptAurum(payload ?? {}) }) } : {}),
        });
        if (response.status === 401) throw new AurumUnauthorizedError("The supplied token is invalid or expired.");
        if (!response.ok) throw new Error(`Aurum API returned HTTP ${response.status}.`);
        const body = await response.json() as { encrypted?: unknown };
        if (typeof body.encrypted !== "string") throw new Error("Aurum API returned an unexpected response.");
        return decryptAurum(body.encrypted);
      } catch (error) {
        if (error instanceof AurumUnauthorizedError) throw error;
        lastError = error;
        if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Aurum request failed.");
}

export function aurumGet(token: string, url: string, origin: string) {
  return request(token, url, origin, "GET");
}

export function aurumPost(token: string, url: string, origin: string, payload: Record<string, unknown>) {
  return request(token, url, origin, "POST", payload);
}
