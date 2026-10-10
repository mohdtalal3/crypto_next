import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { BackLink } from "@/components/layout/BackLink";
import { PeopleTable } from "@/components/admin/PeopleTable";
import { requireStaff } from "@/lib/auth/guards";
import { peoplePage } from "@/services/admin.service";

const PAGE_SIZE = 20;

export default async function AdminPeople({ searchParams }: { searchParams: Promise<{ error?: string; page?: string; q?: string }> }) {
  const session = await requireStaff();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = typeof params.q === "string" ? params.q : "";
  const [result, { error }] = await Promise.all([peoplePage(page, session.role !== "founder", search), searchParams]);
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const current = Math.min(page, pages);
  const people = current === page ? result.rows : (await peoplePage(current, session.role !== "founder", search)).rows;
  return <div className="layout"><AdminSidebar active="people" founder={session.role === "founder"}/><main className="wrap">
    <header className="topbar"><div><h1>People</h1><p className="subtitle">{result.total} people have used the portal — click Neo or Orbit to browse their synced data.</p></div><BackLink/></header>
    {error && <p className="alert">⚠️ {error}</p>}
    <PeopleTable people={people} founder={session.role === "founder"} page={current} pages={pages} total={result.total} search={search}/>
  </main></div>;
}
