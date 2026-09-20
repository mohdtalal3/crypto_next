import { ProfileView } from "@/components/dashboard/NeoDataViews";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireSession } from "@/lib/auth/guards";
import { userInfoFor } from "@/lib/db/portal";

export default async function Profile(){const s=await requireSession();const info=await userInfoFor(s.userId);return <div className="layout"><Sidebar active="/dashboard/profile"/><main className="wrap"><header className="topbar"><div><h1>Profile</h1><p className="subtitle">Your Aurum account details — synced from Aurum.</p></div></header>{info?<ProfileView data={info}/>:<p className="card empty">No profile data yet — hit “Sync now” to pull your account info from Aurum.</p>}</main></div>}
