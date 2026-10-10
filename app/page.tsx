import { claimableBalances, observatoryData, type ClaimableBalance, type ObservatoryData } from "@/lib/db/observatory";
import { mapPaths, regionPositions } from "@/lib/map";
import { ObservatoryBoard } from "@/components/observatory/ObservatoryBoard";
import { AuthCtas } from "@/components/observatory/AuthCtas";
import { number } from "@/lib/utils/format";

// Public aggregates rebuild at most once per minute; every other visitor is
// served from the CDN cache regardless of traffic.
export const revalidate = 60;

function emptyData(): ObservatoryData {
  return { members: 0, deltas: { "24H": 0, "7D": 0, "30D": 0 }, history: [], windows: { "24H": [], "7D": [], "30D": [] }, points: {} };
}

const BALANCE_CARDS: Record<string, { label: string; badge: string; note: string; featured?: boolean }> = {
  all_sources: { label: "All Sources Combined", badge: "Total claimable", note: "members holding", featured: true },
  ex_ai_bot: { label: "EX-AI Bot · Total Deposited", badge: "EX-AI", note: "members deposited" },
  main_wallet: { label: "Main Wallet Balance", badge: "Claimable", note: "members holding" },
  partner_wallet: { label: "Partner Program Wallet Balance", badge: "Claimable", note: "members holding" },
};

function BalanceSources({ balances }: { balances: ClaimableBalance[] }) {
  return <section className="card obs-balances">
    <div className="obs-balances-head">
      <div><h2>Claimable Balance Sources</h2><p>EX-AI Bot, Main Wallet, and Partner Program Wallet are the claimable balances in this view. Additional product activity is coming soon.</p></div>
      <span className="obs-guardian-tag">Current claimable balances</span>
    </div>
    <div className="obs-balance-grid">
      {Object.entries(BALANCE_CARDS).map(([source, card]) => {
        const balance = balances.find((entry) => entry.source === source);
        const total = balance?.total ?? 0;
        return <article className={`obs-balance-card ${card.featured ? "featured" : ""}`} key={source}>
          <span className="obs-balance-status">{card.badge}</span>
          <div className="obs-balance-label">{card.label}</div>
          <div className="obs-balance-value">{total > 0 ? <>${number(total, 2)} <em>USDT</em></> : <>—</>}</div>
          <div className="obs-balance-note">{balance && balance.members > 0 ? `${balance.members.toLocaleString("en-US")} ${card.note}` : "Claimable balance source"}</div>
        </article>;
      })}
    </div>
  </section>;
}

export default async function Observatory() {
  const [data, balances, map, positions] = await Promise.all([
    observatoryData().catch(() => emptyData()),
    claimableBalances().catch(() => []),
    Promise.resolve(mapPaths()),
    Promise.resolve(regionPositions()),
  ]);
  const year = new Date().getFullYear();
  return <div className="observatory">
    <header className="obs-topbar">
      <a className="obs-brand" href="/"><img className="obs-logo" src="/logo.png" alt="D.A.R.A."/></a>
      <AuthCtas variant="header"/>
    </header>

    <main className="obs-main">
      <section className="obs-hero">
        <div className="obs-hero-intro">
          <p className="obs-eyebrow"><span className="obs-pulse" aria-hidden="true"/> THE OBSERVATORY <span className="obs-eyebrow-sep">·</span> GLOBAL ONBOARDING</p>
          <h1>The world is finding<br/>its way back.</h1>
          <p className="obs-sub">A live view of members reconnecting with their history. Each new arrival adds another point to the picture.</p>
          <AuthCtas variant="hero"/>
        </div>
      </section>

      <ObservatoryBoard data={data} map={map} positions={positions}/>

      <BalanceSources balances={balances}/>
    </main>

    <footer className="obs-foot">
      <div className="obs-foot-inner">
        <div className="obs-foot-brand"><img src="/logo.png" alt="D.A.R.A."/><span>Digital Asset Recovery Alliance</span></div>
        <nav className="obs-foot-nav"><a href="/login">Member log in</a><a href="/signup">Create account</a></nav>
      </div>
      <div className="obs-foot-legal">© {year} D.A.R.A. — Digital Asset Recovery Alliance. Figures shown are aggregated membership views and update periodically.</div>
    </footer>
  </div>;
}
