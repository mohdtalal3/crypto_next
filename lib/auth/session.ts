import "server-only";

import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import type { PortalSession } from "@/types";

const COOKIE = "aurum_portal_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET || process.env.SECRET_KEY;
  if (!value) throw new Error("SESSION_SECRET (or legacy SECRET_KEY) must be configured.");
  return createHash("sha256").update(value).digest();
}

export async function encodeSession(session: PortalSession) {
  // API tokens are deliberately excluded. They exist only in memory for the
  // one POST /api/token request that immediately performs a sync.
  return new EncryptJWT({ userId: session.userId, email: session.email, role: session.role })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .encrypt(secret());
}

export async function decodeSession(value?: string): Promise<PortalSession | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtDecrypt(value, secret());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  return decodeSession((await cookies()).get(COOKIE)?.value);
}

export async function sessionCookie(session: PortalSession) {
  return {
    name: COOKIE,
    value: await encodeSession(session),
    options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE },
  };
}

export const expiredSessionCookie = {
  name: COOKIE,
  value: "",
  options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 },
};
