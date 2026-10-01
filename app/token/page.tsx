import { requireSession } from "@/lib/auth/guards";
import { TokenForm } from "@/components/auth/TokenForm";
import type { Tool } from "@/types";

export default async function TokenPage({ searchParams }: { searchParams: Promise<{ tool?: Tool; error?: string; step?: string }> }) {
  await requireSession();
  const { tool: given, error, step } = await searchParams;
  const tool = given === "orbit" ? "orbit" : given === "backoffice" ? "backoffice" : "neo";
  const name = tool === "orbit" ? "OrbitOne" : tool === "backoffice" ? "Backoffice.aurum" : "Aurum";
  const timing = tool === "backoffice" ? "This sync usually finishes in under a minute." : "A complete scan takes <strong>3–5 minutes</strong>.";
  return <main className="center"><section className="card auth-card"><img className="logo" src="/logo.png" alt="D.A.R.A."/>
    {tool !== "neo" && step === "otp" ? <>
      <h1>Enter your {name} code</h1><p className="subtitle">Two-factor code from your authenticator app to finish the login.</p>
      {error && <p className="alert">⚠️ {error}</p>}
      <form className="form-stack" method="post" action="/api/auth/tool-login"><input type="hidden" name="tool" value={tool}/><input className="text-input" name="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" required autoFocus/><button className="btn primary" type="submit">Verify & sync</button></form>
    </> : tool !== "neo" ? <>
      <h1>Log in to {name}</h1><p className="subtitle">We log in, extract the token, and sync automatically. {timing.startsWith("This") ? timing.replace(/<[^>]+>/g, "") : "A complete scan takes 3–5 minutes."}</p>
      {error && <p className="alert">⚠️ {error}</p>}
      <form className="form-stack" method="post" action="/api/auth/tool-login"><input type="hidden" name="tool" value={tool}/><input className="text-input" type="email" name="email" placeholder="Email" required autoFocus/><input className="text-input" type="password" name="password" placeholder="Password" required/><button className="btn primary" type="submit">Log in & sync</button></form>
    </> : <>
      <h1>Sync your {name} account</h1><p className="subtitle">Paste a current {name} token to start this one-time sync. A complete scan takes <strong>3–5 minutes</strong>.</p>
      {error && <p className="alert">⚠️ {error}</p>}
      <TokenForm tool={tool}/>
    </>}
    <p className="hint">Your credentials are used only for this login, and the extracted token only for this sync — neither is stored in Supabase or your portal session.</p>
  </section></main>;
}
