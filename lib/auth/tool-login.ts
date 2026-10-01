import "server-only";

import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { secret } from "@/lib/auth/session";
import type { Tool } from "@/types";

const COOKIE = "aurum_tool_login";
const MAX_AGE = 600; // 10 minutes — just enough to receive and enter the OTP code.

export interface PendingToolLogin {
  tool: "orbit" | "backoffice";
  email: string;
  password: string;
}

/**
 * Holds the credentials between the login and OTP steps in a short-lived,
 * encrypted, HTTP-only cookie. Cleared as soon as the OTP step completes.
 */
export async function setPendingToolLogin(pending: PendingToolLogin) {
  const value = await new EncryptJWT({ tool: pending.tool, email: pending.email, password: pending.password })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .encrypt(secret());
  (await cookies()).set(COOKIE, value, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}

export async function readPendingToolLogin(): Promise<PendingToolLogin | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtDecrypt(raw, secret());
    if (typeof payload.email !== "string" || typeof payload.password !== "string") return null;
    const tool = payload.tool === "orbit" ? "orbit" : "backoffice";
    return { tool: tool as "orbit" | "backoffice", email: payload.email, password: payload.password };
  } catch {
    return null;
  }
}

export async function clearPendingToolLogin() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}
