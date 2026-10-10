import { requireSession } from "@/lib/auth/guards";
import { isStaff } from "@/lib/auth/roles";

export default async function Tools() {
  const session = await requireSession();
  return <main className="tools-page">
    <header className="site-header">
      <a className="site-brand" href="/">
        <img className="site-logo" src="/logo.png" alt="D.A.R.A."/>
      </a>
      <nav className="site-actions">
        <a className="btn ghost" href="/">Home</a>
        <form action="/api/auth/logout" method="post"><button className="btn primary" type="submit">Log out</button></form>
      </nav>
    </header>

    <section className="tools-hero">
      <p className="tools-eyebrow">Member portal</p>
      <h1>Choose a tool</h1>
      <p className="subtitle">Welcome back, {session.email} — pick a tool to continue.</p>
    </section>

    <div className="tools">
      {isStaff(session.role) && <a className="card tool" href="/admin/users">
        <span className="tool-icon">🛡️</span>
        <h2>Admin dashboard</h2>
        <p>Browse everyone using the portal and open their Backoffice.aurum or OrbitOne data.</p>
        <span className="badge done">{session.role === "founder" ? "Founder" : "Staff"}</span>
      </a>}
      {/* Neo Bank hidden from the selector — re-enable when needed: <a className="card tool" href="/dashboard"><span className="tool-icon">🏦</span><h2>Neo Bank</h2><p>Transactions, wallet, partner program, live trading & EX-AI PRO.</p><span className="badge done">Active</span></a> */}
      <a className="card tool" href="/backoffice/affiliates">
        <span className="tool-icon">🗂️</span>
        <h2>Backoffice.aurum</h2>
        <p>Affiliate stats and partner directory.</p>
        <span className="badge done">Active</span>
      </a>
      <a className="card tool" href="/orbit">
        <span className="tool-icon">🪐</span>
        <h2>OrbitOne</h2>
        <p>Balance, subscription status and EX-AI statistics.</p>
        <span className="badge done">Active</span>
      </a>
      <a className="card tool" href="/claim">
        <span className="tool-icon">🎫</span>
        <h2>Claim</h2>
        <p>Generate and manage your claim numbers.</p>
        <span className="badge done">Active</span>
      </a>
    </div>
  </main>;
}
