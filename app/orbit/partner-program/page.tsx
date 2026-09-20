import { OrbitSidebar } from "@/components/layout/OrbitSidebar";
import { PartnerProgramDashboard } from "@/components/orbit/PartnerProgramDashboard";
import { viewAs } from "@/lib/auth/guards";
import { orbitPartnerProgramFor } from "@/lib/db/portal";

export default async function OrbitPartnerProgramPage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const data = await orbitPartnerProgramFor(userId);
  return <div className="layout"><OrbitSidebar active="partner" viewing={viewing}/><main className="wrap orbit-partner-page"><header className="topbar"><div><h1>Partner Program</h1><p className="subtitle">Legacy levels, premium rewards, team profitshare, and referral accruals — synced from OrbitOne.</p></div></header>{data ? <PartnerProgramDashboard data={data}/> : <section className="card"><p className="empty">No OrbitOne partner data yet — sync OrbitOne to load your partner program.</p></section>}</main></div>;
}
