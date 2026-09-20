import { ReferralBotsTable } from "@/components/dashboard/ReferralBotsTable";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireSession } from "@/lib/auth/guards";
import { partnerStatsFor, referralBotsFor } from "@/lib/db/portal";

export default async function Bots(){const s=await requireSession();const [bots,stats]=await Promise.all([referralBotsFor(s.userId),partnerStatsFor(s.userId)]);const summary=(stats?.referralTrading??{}) as Record<string,unknown>;return <div className="layout"><Sidebar active="/dashboard/partner/bots"/><main className="wrap"><header className="topbar"><div><h1>Partner statistics</h1><p className="subtitle">Referral trading bots and commissions — synced from Aurum.</p></div></header><section className="stats">{Object.entries(summary).map(([k,v])=><div className="card stat" key={k}><span className="stat-label">{k}</span><span className="stat-value">{String(v??"—")}</span></div>)}</section><ReferralBotsTable bots={bots}/></main></div>}
