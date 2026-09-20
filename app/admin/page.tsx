import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireFounder } from "@/lib/auth/guards";
import { roleLabel } from "@/lib/auth/roles";
import { portalPeople, staffRoles } from "@/services/admin.service";
import { staffList } from "@/lib/db/portal";

export default async function AdminStaff({ searchParams }: { searchParams: Promise<{ error?: string; created?: string; updated?: string }> }) {
  const session = await requireFounder();
  const [staff, people, { error, created, updated }] = await Promise.all([staffList(), portalPeople(), searchParams]);
  const emails = new Map(people.map((p) => [p.id, p.email]));
  return <div className="layout"><AdminSidebar active="staff" founder/><main className="wrap">
    <header className="topbar"><div><h1>Staff access</h1><p className="subtitle">Create logins for CEO, COO and other staff — and revoke or restore their access.</p></div></header>
    {error && <p className="alert">⚠️ {error}</p>}
    {created && <p className="alert in">Login created.</p>}
    {updated && <p className="alert in">Staff member updated.</p>}
    <section className="card">
      <h2>Create a staff login</h2>
      <form action="/api/admin/staff" method="post" className="filters">
        <input className="text-input" type="email" name="email" placeholder="Email" required/>
        <input className="text-input" type="password" name="password" placeholder="Password (min 8 characters)" minLength={8} required/>
        <select name="role" defaultValue="ceo">{staffRoles.map((role) => <option key={role} value={role}>{roleLabel[role]}</option>)}</select>
        <button className="btn primary" type="submit">Create login</button>
      </form>
    </section>
    <section className="card table-card"><table><thead><tr><th>Staff member</th><th>Role</th><th>Status</th><th>Change role</th><th>Access</th></tr></thead><tbody>
      {staff.map((member) => <tr key={member.user_id}>
        <td>{emails.get(member.user_id) ?? member.user_id.slice(0, 8)}</td>
        <td><span className="badge">{roleLabel[member.role]}</span></td>
        <td><span className={`badge ${member.active ? "done" : "pending"}`}>{member.active ? "Active" : "Revoked"}</span></td>
        <td>
          {member.role === "founder" ? <span className="hint">—</span> : <form action={`/api/admin/staff/${member.user_id}`} method="post" className="inline-form">
            <select name="role" defaultValue={member.role}>{staffRoles.map((role) => <option key={role} value={role}>{roleLabel[role]}</option>)}</select>
            <button className="btn ghost" type="submit">Save</button>
          </form>}
        </td>
        <td>
          {member.role === "founder" ? <span className="hint">—</span> : <form action={`/api/admin/staff/${member.user_id}`} method="post">
            <input type="hidden" name="active" value={member.active ? "false" : "true"}/>
            <button className={`btn ${member.active ? "ghost" : "primary"}`} type="submit">{member.active ? "Revoke access" : "Restore access"}</button>
          </form>}
        </td>
      </tr>)}
    </tbody></table>{!staff.length && <p className="empty">No staff yet — create the first login above.</p>}</section>
  </main></div>;
}
