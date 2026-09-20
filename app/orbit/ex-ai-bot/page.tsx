import { ExAiBotDashboard } from "@/components/orbit/ExAiBotDashboard";
import { OrbitSidebar } from "@/components/layout/OrbitSidebar";
import { viewAs } from "@/lib/auth/guards";
import { exAiBotFor } from "@/lib/db/portal";

export default async function ExAiBotPage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const data = await exAiBotFor(userId);
  return <div className="layout"><OrbitSidebar active="bot" viewing={viewing}/><main className="wrap investment-page"><header className="topbar"><div><h1>Ex-AI Bot</h1><p className="subtitle">Deposit packages, balance, and investment history — synced from OrbitOne.</p></div></header>{data ? <ExAiBotDashboard data={data}/> : <section className="card"><p className="empty">No Ex-AI Bot data yet — sync OrbitOne to load your investments.</p></section>}</main></div>;
}
