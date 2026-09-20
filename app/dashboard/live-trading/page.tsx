import { LiveTradingView } from "@/components/dashboard/NeoDataViews";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireSession } from "@/lib/auth/guards";
import { liveTradingFor } from "@/lib/db/portal";

export default async function Live(){const s=await requireSession();const data=await liveTradingFor(s.userId);return <div className="layout"><Sidebar active="/dashboard/live-trading"/><main className="wrap"><header className="topbar"><div><h1>Live Trading</h1><p className="subtitle">Balances, available pairs and bots — synced from Aurum.</p></div></header>{data?<LiveTradingView data={data}/>:<p className="card empty">No live trading data yet — hit “Sync now” to pull it from Aurum.</p>}</main></div>}
