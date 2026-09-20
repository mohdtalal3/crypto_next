import { NextResponse } from "next/server";
import { getSession, sessionCookie } from "@/lib/auth/session";
import { toolSchema } from "@/lib/validation/request";
import { syncTool, SyncUnauthorizedError } from "@/services/sync.service";
import { AppError } from "@/lib/utils/errors";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/", request.url), 303);
  const form = await request.formData();
  const parsed = toolSchema.safeParse(form.get("tool") ?? "neo");
  if (!parsed.success) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent("Invalid sync request.")}`, request.url), 303);
  const tool = parsed.data;
  const target = tool === "neo" ? "/dashboard" : "/orbit";
  const token = tool === "neo" ? session.aurumToken : session.orbitToken;
  if (!token) return NextResponse.redirect(new URL(`/token?tool=${tool}`, request.url), 303);
  try {
    await syncTool(session, tool);
    return NextResponse.redirect(new URL(target, request.url), 303);
  } catch (error) {
    const message = error instanceof AppError ? error.message : "Sync failed. Please try again.";
    if (error instanceof SyncUnauthorizedError) {
      const cleared = { ...session, ...(tool === "neo" ? { aurumToken: undefined } : { orbitToken: undefined }) };
      const response = NextResponse.redirect(new URL(`/token?tool=${tool}&error=${encodeURIComponent(message)}`, request.url), 303);
      const cookie = await sessionCookie(cleared);
      response.cookies.set(cookie.name, cookie.value, cookie.options);
      return response;
    }
    return NextResponse.redirect(new URL(`${target}?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
