import { NextResponse } from "next/server";
import { getSession, sessionCookie } from "@/lib/auth/session";
import { toolSchema } from "@/lib/validation/request";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/", request.url), 303);
  const form = await request.formData();
  const parsed = toolSchema.safeParse(form.get("tool") ?? "neo");
  if (!parsed.success) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent("Invalid sync request.")}`, request.url), 303);
  const tool = parsed.data;
  // This route is retained for compatibility. A token is never kept in the
  // session, so redirect to the one-time token form and rewrite legacy cookies.
  const response = NextResponse.redirect(new URL(`/token?tool=${tool}`, request.url), 303);
  const cookie = await sessionCookie(session);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
