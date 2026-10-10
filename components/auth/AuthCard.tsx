import { PasswordInput } from "@/components/auth/PasswordInput";
export function AuthCard({ mode, error }: { mode: "login" | "signup"; error?: string }) {
  const signup = mode === "signup";
  const year = new Date().getFullYear();
  return <main className="auth-page">
    <aside className="auth-brand">
      <a className="auth-brand-logo" href="/"><img src="/logo.png" alt="D.A.R.A."/></a>
      <div className="auth-brand-copy">
        <h2>{signup ? "Begin your recovery journey." : "Your recovery, in one place."}</h2>
        <p>One portal for Neo Bank accounts, OrbitOne statistics and claim numbers — synced, current and ready when you are.</p>
        <ul className="auth-points">
          <li><b>Unified view</b><span>Neo Bank and OrbitOne side by side.</span></li>
          <li><b>Automated sync</b><span>Balances and transactions stay current.</span></li>
          <li><b>Claim tracking</b><span>Claim numbers generated and archived for you.</span></li>
        </ul>
      </div>
      <p className="auth-brand-foot">© {year} D.A.R.A. — Digital Asset Recovery Alliance</p>
    </aside>
    <section className="auth-panel">
      <div className="card auth-card">
        <a href="/"><img className="logo" src="/logo.png" alt="D.A.R.A."/></a>
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="subtitle">{signup ? "Join the alliance and open your dashboard." : "Log in to your dashboard."}</p>
        {error && <p className="alert">⚠️ {error}</p>}
        <form className="form-stack" action={`/api/auth/${mode}`} method="post">
          <input className="text-input" type="email" name="email" placeholder="you@example.com" required autoFocus />
          <PasswordInput />
          <button className="btn primary wide" type="submit">{signup ? "Create account" : "Log in"}</button>
        </form>
        <p className="divider">or</p>
        <a className="btn ghost wide" href={signup ? "/login" : "/signup"}>{signup ? "I already have an account" : "New here? Create an account"}</a>
      </div>
    </section>
  </main>;
}
