import { ClaimSidebar } from "@/components/layout/ClaimSidebar";
import { BackLink } from "@/components/layout/BackLink";
import { requireSession } from "@/lib/auth/guards";
import { claimsFor } from "@/services/claim.service";
import { userBalancesFor } from "@/lib/db/portal";
import { number } from "@/lib/utils/format";

export default async function ClaimDashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireSession();
  const [claims, balances, { error }] = await Promise.all([claimsFor(session.userId), userBalancesFor(session.userId), searchParams]);
  return <div className="layout"><ClaimSidebar active="claims"/><main className="wrap">
    <header className="topbar"><div><h1>Claims</h1><p className="subtitle">{claims.length} claim number{claims.length === 1 ? "" : "s"} · auto-generated when you sync Backoffice.aurum (Aurum-[pretty ID]-MCA001, 002, 003…)</p></div><BackLink/></header>
    {error && <p className="alert">⚠️ {error}</p>}
    {balances
      ? <section className="stats">
          <div className="card stat"><span className="stat-label">EX-AI Bot deposits</span><span className="stat-value">{number(balances.exAiBot, 2)} <small>USDT</small></span></div>
          <div className="card stat"><span className="stat-label">Main wallet</span><span className="stat-value">{number(balances.mainWallet, 2)} <small>USDT</small></span></div>
          <div className="card stat"><span className="stat-label">Partner wallet</span><span className="stat-value">{number(balances.partnerWallet, 2)} <small>USDT</small></span></div>
          <div className="card stat"><span className="stat-label">Total claimable</span><span className="stat-value">{number(balances.total, 2)} <small>USDT</small></span></div>
        </section>
      : <p className="hint">Your claimable balances appear here after your first OrbitOne sync.</p>}
    <section className="card table-card"><table><thead><tr><th>Claim number</th><th>Pretty ID</th><th>Created</th></tr></thead><tbody>
      {claims.map((claim) => <tr key={claim.id}>
        <td><strong className="mono">{claim.claim_number}</strong></td>
        <td className="mono">{claim.pretty_id ?? "—"}</td>
        <td>{claim.created_at.slice(0, 10)}</td>
      </tr>)}
    </tbody></table>{!claims.length && <p className="empty">No claim numbers yet — sync Backoffice.aurum once and your first one is generated automatically.</p>}</section>
  </main></div>;
}
