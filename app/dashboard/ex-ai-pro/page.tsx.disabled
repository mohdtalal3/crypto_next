import { ZeusProView } from "@/components/dashboard/NeoDataViews";
import { Sidebar } from "@/components/layout/Sidebar";
import { viewAs } from "@/lib/auth/guards";
import { zeusProFor } from "@/lib/db/portal";

export default async function Zeus({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const data = await zeusProFor(userId);
  return <div className="layout"><Sidebar active="/dashboard/ex-ai-pro" viewing={viewing}/><main className="wrap"><header className="topbar"><div><h1>EX-AI PRO</h1><p className="subtitle">Zeus Pro activation status — synced from Aurum.</p></div></header>{data?<ZeusProView data={data}/>:<p className="card empty">No EX-AI PRO data yet — hit “Sync now” to pull it from Aurum.</p>}</main></div>;
}
