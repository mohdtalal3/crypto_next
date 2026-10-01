import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { clearPendingToolLogin, readPendingToolLogin, setPendingToolLogin } from "@/lib/auth/tool-login";
import { completeToolLogin, startToolLogin } from "@/services/tool-login.service";
import { toolLoginSchema, toolOtpSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

const tokenPage = (tool: string, extra = "") => `/token?tool=${tool}${extra}`;

/** The page shown after a successful login: the extracted token, then the sync starts. */
function extractedPage(tool: "orbit" | "backoffice", token: string) {
  const name = tool === "orbit" ? "OrbitOne" : "Backoffice.aurum";
  const escape = (value: string) => value.replaceAll("<", `${String.fromCharCode(38)}lt;`).replaceAll('"', `${String.fromCharCode(38)}quot;`);
  const safe = escape(token);
  return new Response(`<!doctype html><html><head><meta charset="utf-8"/><title>Token extracted</title>
<style>body{margin:0;background:#000;color:#e8ecf3;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:grid;place-items:center;min-height:100vh}.card{background:#0a0a0d;border:1px solid #1e1e26;border-radius:16px;padding:28px;max-width:560px;width:calc(100% - 40px);text-align:center}h1{margin:0 0 8px;font-size:22px}.muted{color:#8b94a7}.token{display:block;word-break:break-all;background:#111116;border:1px solid #1e1e26;border-radius:10px;padding:12px;font:12px ui-monospace,Menlo,monospace;color:#9fe0b9;margin:16px 0}.btn{display:inline-block;border:1px solid #1e1e26;border-radius:9px;padding:10px 15px;background:#6c8cff;color:#06111e;font-weight:600;text-decoration:none;cursor:pointer}.spin{width:30px;height:30px;border:3px solid #fff3;border-top-color:#6c8cff;border-radius:50%;animation:s 1s linear infinite;margin:14px auto 0}@keyframes s{to{transform:rotate(360deg)}}</style></head>
<body><div class="card"><h1>Token extracted</h1><p class="muted">Logged in to ${name} — syncing your account now.</p>
<code class="token">${safe}</code>
<form method="post" action="/api/token"><input type="hidden" name="tool" value="${tool}"/><input type="hidden" name="token" value="${safe}"/><button class="btn" type="submit">Save & sync now</button></form>
<div class="spin"></div></div>
<script>setTimeout(function(){document.forms[0].submit();},2500);</script></body></html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/", request.url), 303);
  const form = await request.formData();
  const tool = form.get("tool") === "orbit" ? "orbit" : "backoffice";
  const otp = form.get("otp");

  if (typeof otp === "string" && otp) {
    const parsed = toolOtpSchema.safeParse({ tool, otp });
    if (!parsed.success) return NextResponse.redirect(new URL(`/token?tool=${tool}&step=otp&error=${encodeURIComponent(parsed.error.issues[0].message)}`, request.url), 303);
    const pending = await readPendingToolLogin();
    if (!pending || pending.tool !== tool) return NextResponse.redirect(new URL(`/token?tool=${tool}&error=${encodeURIComponent("The login session expired — start again.")}`, request.url), 303);
    try {
      const token = await completeToolLogin(tool, pending.email, pending.password, parsed.data.otp);
      await clearPendingToolLogin();
      return extractedPage(tool, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      return NextResponse.redirect(new URL(`/token?tool=${tool}&step=otp&error=${encodeURIComponent(message)}`, request.url), 303);
    }
  }

  const parsed = toolLoginSchema.safeParse({ tool, email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return NextResponse.redirect(new URL(`/token?tool=${tool}&error=${encodeURIComponent(parsed.error.issues[0].message)}`, request.url), 303);
  try {
    const result = await startToolLogin(tool, parsed.data.email, parsed.data.password);
    if (result.token) return extractedPage(tool, result.token);
    await setPendingToolLogin({ tool, email: parsed.data.email, password: parsed.data.password });
    return NextResponse.redirect(new URL(`/token?tool=${tool}&step=otp`, request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.redirect(new URL(`/token?tool=${tool}&error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
