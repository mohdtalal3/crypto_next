import { BackofficeProfileView } from "@/components/backoffice/BackofficeProfileView";
import { BackofficeSidebar } from "@/components/layout/BackofficeSidebar";
import { viewAs } from "@/lib/auth/guards";
import { backofficeProfileFor } from "@/lib/db/portal";

export default async function BackofficeProfilePage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const data = await backofficeProfileFor(userId);
  return <div className="layout"><BackofficeSidebar active="profile" viewing={viewing}/><main className="wrap"><header className="topbar"><div><h1>Profile</h1><p className="subtitle">Backoffice account details — synced from Backoffice.aurum.</p></div></header>{data ? <BackofficeProfileView data={data}/> : <p className="card empty">No Backoffice profile yet — hit “Sync now” to pull it from Backoffice.aurum.</p>}</main></div>;
}
