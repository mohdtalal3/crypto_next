import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireStaff } from "@/lib/auth/guards";
import { transactionSummaryEveryone } from "@/lib/db/portal";
import { number } from "@/lib/utils/format";

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireStaff();
  const [{ people, transactions, tickers }, { error }] = await Promise.all([transactionSummaryEveryone(), searchParams]);
  return <div className="layout"><AdminSidebar active="overview" founder={session.role === "founder"}/><main className="wrap">
    <header className="topbar"><div><h1>Overview</h1><p className="subtitle">All people combined — per-ticker KPIs aggregated across the portal.</p></div></header>
    {error && <p className="alert">⚠️ {error}</p>}
    <section className="stats">
      <div className="card stat"><span className="stat-label">People with transactions</span><span className="stat-value">{people}</span></div>
      <div className="card stat"><span className="stat-label">Transactions total</span><span className="stat-value">{transactions}</span></div>
      {tickers.map((t) => <div className="card stat" key={t.ticker}>
        <span className="stat-label">{t.ticker} · {t.count} tx</span>
        {t.in > 0 && <span className="stat-line in">in +{number(t.in)} <small>{t.ticker}</small></span>}
        {t.out > 0 && <span className="stat-line out">out −{number(t.out)} <small>{t.ticker}</small></span>}
      </div>)}
    </section>
    {!tickers.length && <p className="card empty">No aggregated stats yet — they fill in as people sync Neo Bank.</p>}
  </main></div>;
}
