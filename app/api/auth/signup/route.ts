import { NextResponse } from "next/server";
import { signUp } from "@/services/auth.service";
import { sessionCookie } from "@/lib/auth/session";
import { credentialsSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = credentialsSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(parsed.error.issues[0].message)}`, request.url), 303);
  try {
    const response = NextResponse.redirect(new URL("/tools", request.url), 303);
    const cookie = await sessionCookie(await signUp(parsed.data.email, parsed.data.password));
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed.";
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
