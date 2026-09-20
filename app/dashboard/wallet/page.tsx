import { WalletView } from "@/components/dashboard/NeoDataViews";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireSession } from "@/lib/auth/guards";
import { walletFor } from "@/lib/db/portal";

export default async function Wallet(){const s=await requireSession();const data=await walletFor(s.userId);return <div className="layout"><Sidebar active="/dashboard/wallet"/><main className="wrap"><header className="topbar"><div><h1>Wallet</h1><p className="subtitle">Balances and deposit addresses — synced from Aurum.</p></div></header>{data?<WalletView data={data}/>:<p className="card empty">No wallet data yet — hit “Sync now” to pull it from Aurum.</p>}</main></div>}
