import { ProfileView } from "@/components/dashboard/NeoDataViews";
import { Sidebar } from "@/components/layout/Sidebar";
import { viewAs } from "@/lib/auth/guards";
import { userInfoFor } from "@/lib/db/portal";

export default async function Profile({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { userId, viewing } = await viewAs(await searchParams);
  const info = viewing ? null : await userInfoFor(userId);
  return <div className="layout"><Sidebar active="/dashboard/profile" viewing={viewing}/><main className="wrap"><header className="topbar"><div><h1>Profile</h1><p className="subtitle">Aurum account details — synced from Aurum.</p></div></header>{viewing ? <p className="card empty">Profile details are only visible to the account owner.</p> : info ? <ProfileView data={info}/> : <p className="card empty">No profile data yet — hit “Sync now” to pull your account info from Aurum.</p>}</main></div>;
}
