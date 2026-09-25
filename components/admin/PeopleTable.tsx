"use client";

import { useMemo, useState } from "react";
import { isStaff, roleLabel } from "@/lib/auth/roles";
import type { PortalPerson } from "@/types";

const date = (value: string | null) => value ? value.slice(0, 10) : "—";

export function PeopleTable({ people, founder }: { people: PortalPerson[]; founder: boolean }) {
  const [search, setSearch] = useState("");
  const visible = useMemo(() => people.filter((p) => p.email.toLowerCase().includes(search.toLowerCase())), [people, search]);
  return <>
    <section className="card filters"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search by email…"/></section>
    <section className="card table-card"><table><thead><tr><th>Person</th><th>Role</th><th>Status</th><th>Joined</th><th>Last login</th><th>Open</th></tr></thead><tbody>
      {visible.map((p) => <tr key={p.id}>
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
    </tbody></table>{!visible.length && <p className="empty">No people match that search.</p>}</section>
  </>;
}
