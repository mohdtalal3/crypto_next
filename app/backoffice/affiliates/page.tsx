import { AffiliatesView } from "@/components/backoffice/AffiliatesView";
import { BackofficeSidebar } from "@/components/layout/BackofficeSidebar";
import { viewAs } from "@/lib/auth/guards";
import { backofficeAffiliatesFor, partnerStatsFor } from "@/lib/db/portal";

export default async function BackofficeAffiliates({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const [snapshot, legacy] = await Promise.all([backofficeAffiliatesFor(userId), partnerStatsFor(userId)]);
  const data = snapshot ?? (legacy && (legacy.affiliateStats || legacy.partners) ? legacy : null);
  return <div className="layout"><BackofficeSidebar active="affiliates" viewing={viewing}/><main className="wrap"><header className="topbar"><div><h1>Affiliates</h1><p className="subtitle">Affiliate stats and partner directory — synced from Aurum.</p></div></header>{data ? <AffiliatesView data={data}/> : <p className="card empty">No affiliate data yet — sync Neo Bank to pull it from Aurum.</p>}</main></div>;
}
