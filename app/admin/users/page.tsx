import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PeopleTable } from "@/components/admin/PeopleTable";
import { requireStaff } from "@/lib/auth/guards";
import { portalPeople } from "@/services/admin.service";

export default async function AdminPeople({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireStaff();
  const [everyone, { error }] = await Promise.all([portalPeople(), searchParams]);
  const people = session.role === "founder" ? everyone : everyone.filter((p) => p.role !== "founder");
  return <div className="layout"><AdminSidebar active="people" founder={session.role === "founder"}/><main className="wrap">
    <header className="topbar"><div><h1>People</h1><p className="subtitle">{people.length} people have used the portal — click Neo or Orbit to browse their synced data.</p></div></header>
    {error && <p className="alert">⚠️ {error}</p>}
    <PeopleTable people={people} founder={session.role === "founder"}/>
  </main></div>;
}
