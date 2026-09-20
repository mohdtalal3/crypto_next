import { PartnerView } from "@/components/dashboard/NeoDataViews";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireSession } from "@/lib/auth/guards";
import { partnerStatsFor } from "@/lib/db/portal";

export default async function Partner(){const session=await requireSession();const data=await partnerStatsFor(session.userId);return <div className="layout"><Sidebar active="/dashboard/partner"/><main className="wrap"><header className="topbar"><div><h1>Partner program</h1><p className="subtitle">Your affiliate program overview — synced from Aurum.</p></div></header>{data?<><PartnerView data={data}/><p><a className="btn primary" href="/dashboard/partner/bots">View partner statistics</a></p></>:<p className="card empty">No partner stats yet — hit “Sync now” to pull them from Aurum.</p>}</main></div>}
