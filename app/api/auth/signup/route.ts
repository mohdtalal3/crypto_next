import { NextResponse } from "next/server";
import { signUp } from "@/services/auth.service";
import { sessionCookie } from "@/lib/auth/session";
import { credentialsSchema } from "@/lib/validation/auth";
import { geoFromRequest } from "@/lib/auth/geo";
import { captureGeo } from "@/lib/db/observatory";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = credentialsSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(parsed.error.issues[0].message)}`, request.url), 303);
  try {
    const session = await signUp(parsed.data.email, parsed.data.password);
    try {
      await captureGeo(session.userId, geoFromRequest(request));
    } catch {
      // Location is best-effort — never block a signup over it.
    }
    const response = NextResponse.redirect(new URL("/tools", request.url), 303);
    const cookie = await sessionCookie(session);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed.";
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
