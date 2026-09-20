import { NextResponse } from "next/server";
import { getSession, sessionCookie } from "@/lib/auth/session";
import { tokenSchema } from "@/lib/validation/auth";
import { syncTool } from "@/services/sync.service";
import { AppError } from "@/lib/utils/errors";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/", request.url), 303);
  const form = await request.formData();
  const parsed = tokenSchema.safeParse({ tool: form.get("tool"), token: String(form.get("token") ?? "").replace(/^Bearer\s+/i, "") });
  const tool = parsed.success ? parsed.data.tool : (form.get("tool") === "orbit" ? "orbit" : "neo");
  if (!parsed.success) return NextResponse.redirect(new URL(`/token?tool=${tool}&error=${encodeURIComponent(parsed.error.issues[0].message)}`, request.url), 303);
  const transient = { ...session, aurumToken: tool === "neo" ? parsed.data.token : undefined, orbitToken: tool === "orbit" ? parsed.data.token : undefined };
  try {
    await syncTool(transient, tool);
    const response = NextResponse.redirect(new URL(tool === "neo" ? "/dashboard" : "/orbit", request.url), 303);
    const cookie = await sessionCookie(session);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    const message = error instanceof AppError ? error.message : "Sync failed. Please try again.";
    const response = NextResponse.redirect(new URL(`/token?tool=${tool}&error=${encodeURIComponent(message)}`, request.url), 303);
    const cookie = await sessionCookie(session);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  }
}
