import { ClaimSidebar } from "@/components/layout/ClaimSidebar";
import { requireSession } from "@/lib/auth/guards";
import { claimsFor } from "@/services/claim.service";

export default async function ClaimDashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireSession();
  const [claims, { error }] = await Promise.all([claimsFor(session.userId), searchParams]);
  return <div className="layout"><ClaimSidebar active="claims"/><main className="wrap">
    <header className="topbar"><div><h1>Claims</h1><p className="subtitle">{claims.length} claim number{claims.length === 1 ? "" : "s"} · auto-generated when you sync Backoffice.aurum (Aurum-[pretty ID]-MCA001, 002, 003…)</p></div></header>
    {error && <p className="alert">⚠️ {error}</p>}
    <section className="card table-card"><table><thead><tr><th>Claim number</th><th>Pretty ID</th><th>Created</th></tr></thead><tbody>
      {claims.map((claim) => <tr key={claim.id}>
        <td><strong className="mono">{claim.claim_number}</strong></td>
        <td className="mono">{claim.pretty_id ?? "—"}</td>
        <td>{claim.created_at.slice(0, 10)}</td>
      </tr>)}
    </tbody></table>{!claims.length && <p className="empty">No claim numbers yet — sync Backoffice.aurum once and your first one is generated automatically.</p>}</section>
  </main></div>;
}
