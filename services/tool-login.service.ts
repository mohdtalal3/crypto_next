import "server-only";

import { Agent, ProxyAgent, fetch } from "undici";
import { decryptAurum, encryptAurum } from "@/scraping/shared/crypto";
import { proxyUrl } from "@/scraping/shared/http";
import { AppError } from "@/lib/utils/errors";
import type { Tool } from "@/types";

const API = "https://mini.aurum.foundation";
const ORIGINS: Record<"orbit" | "backoffice", string> = {
  orbit: "https://app.orbitone.finance",
  backoffice: "https://backoffice.aurum.foundation",
};

/**
 * Sticky proxy for the login flow: the DataImpulse-style gateway picks a
 * dedicated exit IP when the port is replaced with a number in 10000-20000,
 * so the credentials step and the OTP step share one IP.
 */
function stickyDispatcher(port?: number) {
  const base = proxyUrl();
  if (!base) return undefined;
  const stickyPort = port ?? 10000 + Math.floor(Math.random() * 10001);
  return new ProxyAgent(base.replace(/:\d+$/, `:${stickyPort}`));
}

type LoginResponse = { data?: { accessToken?: unknown }; totpRequired?: unknown; error?: unknown; [key: string]: unknown };

async function loginPost(payload: Record<string, unknown>, origin: string, stickyPort?: number): Promise<LoginResponse> {
  const response = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "accept": "application/json, text/plain, */*",
      "content-type": "application/json",
      "origin": origin,
      "referer": `${origin}/`,
      "x-requested-with": "aurum-with",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({ encrypted: encryptAurum(payload) }),
    ...(proxyUrl() ? { dispatcher: stickyDispatcher(stickyPort) } : {}),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new AppError("TOOL_LOGIN_FAILED", `Login request failed (HTTP ${response.status}).`, 502);
  const body = await response.json() as { encrypted?: unknown };
  if (typeof body.encrypted !== "string") throw new AppError("TOOL_LOGIN_FAILED", "Login returned an unexpected response.", 502);
  return decryptAurum(body.encrypted) as LoginResponse;
}

/** First step: credentials. Returns the token directly, or flags that an OTP code is required (with the sticky port to reuse). */
export async function startToolLogin(tool: "orbit" | "backoffice", email: string, password: string): Promise<{ token?: string; otpRequired?: boolean; stickyPort?: number }> {
  const stickyPort = 10000 + Math.floor(Math.random() * 10001);
  const response = await loginPost({ email, password }, ORIGINS[tool], stickyPort);
  if (typeof response.data?.accessToken === "string") return { token: response.data.accessToken };
  if (response.totpRequired) return { otpRequired: true, stickyPort };
  throw new AppError("TOOL_LOGIN_FAILED", typeof response.error === "string" ? response.error : "Login failed — check the email and password.", 401);
}

/** Second step: credentials + OTP code over the same sticky session. Returns the access token. */
export async function completeToolLogin(tool: "orbit" | "backoffice", email: string, password: string, otp: string, stickyPort?: number): Promise<string> {
  const response = await loginPost({ email, password, token: otp }, ORIGINS[tool], stickyPort);
  if (typeof response.data?.accessToken === "string") return response.data.accessToken;
  if (typeof response.error === "string") throw new AppError("TOOL_OTP_INVALID", "The code was rejected — request a fresh one and try again.", 401);
  throw new AppError("TOOL_LOGIN_FAILED", "Login failed — try again.", 401);
}

export const toolName = (tool: Tool) => (tool === "orbit" ? "OrbitOne" : tool === "backoffice" ? "Backoffice.aurum" : "Aurum");
