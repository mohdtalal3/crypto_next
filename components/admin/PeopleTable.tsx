import { isStaff, roleLabel } from "@/lib/auth/roles";
import type { PortalPerson } from "@/types";

const date = (value: string | null) => value ? value.slice(0, 10) : "—";
const PAGE_SIZE = 20;

export function PeopleTable({ people, founder, page, pages, total, search }: {
  people: PortalPerson[]; founder: boolean; page: number; pages: number; total: number; search: string;
}) {
  const link = (target: number) => `/admin/users?page=${target}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
  return <>
    <section className="card filters">
      <form method="get" action="/admin/users">
        <input type="search" name="q" defaultValue={search} placeholder="🔍 Search by email…"/>
        {page > 1 && <input type="hidden" name="page" value="1"/>}
      </form>
    </section>
    <section className="card table-card"><table><thead><tr><th>Person</th><th>Role</th><th>Status</th><th>Joined</th><th>Last login</th><th>Open</th></tr></thead><tbody>
      {people.map((p) => <tr key={p.id}>
        <td>{p.email}</td>
        <td><span className="badge">{roleLabel[p.role]}</span></td>
        <td>{isStaff(p.role) ? <span className={`badge ${p.active ? "done" : "pending"}`}>{p.active ? "Active" : "Revoked"}</span> : <span className="badge done">Active</span>}</td>
        <td>{date(p.createdAt)}</td>
        <td>{date(p.lastSignIn)}</td>
        <td className="actions">
          {/* Neo Bank view hidden — re-enable when needed: <a className="btn ghost" href={`/dashboard?user=${p.id}`}>🏦 Neo</a> */}
          <a className="btn ghost" href={`/orbit?user=${p.id}`}>🪐 Orbit</a>
          <a className="btn ghost" href={`/backoffice/affiliates?user=${p.id}`}>🗂️ Backoffice</a>
          {founder && isStaff(p.role) && p.role !== "founder" && <a className="btn ghost" href="/admin">Manage</a>}
        </td>
      </tr>)}
    </tbody></table>{!people.length && <p className="empty">No people match that search.</p>}</section>
    {pages > 1 && <nav className="pager" aria-label="People pagination">
      {page > 1 ? <a className="btn ghost" href={link(page - 1)}>← Prev</a> : <span/>}
      <span>Page {page} of {pages}</span>
      {page < pages ? <a className="btn ghost" href={link(page + 1)}>Next →</a> : <span/>}
      <span className="hint">{people.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + people.length} of {total}</span>
    </nav>}
  </>;
}
