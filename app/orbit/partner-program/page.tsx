import { OrbitSidebar } from "@/components/layout/OrbitSidebar";
import { PartnerProgramDashboard } from "@/components/orbit/PartnerProgramDashboard";
import { requireSession } from "@/lib/auth/guards";
import { orbitPartnerProgramFor } from "@/lib/db/portal";

export default async function OrbitPartnerProgramPage() {
  const session = await requireSession();
  const data = await orbitPartnerProgramFor(session.userId);
  return <div className="layout"><OrbitSidebar active="partner"/><main className="wrap orbit-partner-page"><header className="topbar"><div><h1>Partner Program</h1><p className="subtitle">Legacy levels, premium rewards, team profitshare, and referral accruals — synced from OrbitOne.</p></div></header>{data ? <PartnerProgramDashboard data={data}/> : <section className="card"><p className="empty">No OrbitOne partner data yet — sync OrbitOne to load your partner program.</p></section>}</main></div>;
}
