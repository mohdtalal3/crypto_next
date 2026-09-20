import { OrbitSidebar } from "@/components/layout/OrbitSidebar";
import { PartnerStatisticsDashboard } from "@/components/orbit/PartnerStatisticsDashboard";
import { viewAs } from "@/lib/auth/guards";
import { orbitPartnerStatisticsFor } from "@/lib/db/portal";

export default async function OrbitPartnerStatisticsPage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const data = await orbitPartnerStatisticsFor(userId);
  return <div className="layout"><OrbitSidebar active="statistics" viewing={viewing}/><main className="wrap orbit-partner-page"><header className="topbar"><div><h1>Partner Statistics</h1><p className="subtitle">Referral-network relationships and legacy-level distribution — synced from OrbitOne.</p></div></header>{data ? <PartnerStatisticsDashboard data={data}/> : <section className="card"><p className="empty">No OrbitOne partner statistics yet — sync OrbitOne to load referrals and rank distribution.</p></section>}</main></div>;
}
