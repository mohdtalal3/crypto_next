import { PartnerView } from "@/components/dashboard/NeoDataViews";
import { Sidebar } from "@/components/layout/Sidebar";
import { viewAs } from "@/lib/auth/guards";
import { partnerStatsFor } from "@/lib/db/portal";

export default async function Partner({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const data = await partnerStatsFor(userId);
  return <div className="layout"><Sidebar active="/dashboard/partner" viewing={viewing}/><main className="wrap"><header className="topbar"><div><h1>Partner program</h1><p className="subtitle">Affiliate program overview — synced from Aurum.</p></div></header>{data?<><PartnerView data={data}/><p><a className="btn primary" href={viewing ? `/dashboard/partner/bots?user=${viewing.id}` : "/dashboard/partner/bots"}>View partner statistics</a></p></>:<p className="card empty">No partner stats yet — hit “Sync now” to pull them from Aurum.</p>}</main></div>;
}
