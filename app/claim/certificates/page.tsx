import { ClaimSidebar } from "@/components/layout/ClaimSidebar";
import { buildExAiCertificateData, buildPartnerCertificateData, depositShortId, parseExAi } from "@/lib/utils/certificate-data";
import { requireSession } from "@/lib/auth/guards";
import { exAiBotFor, orbitPartnerProgramFor } from "@/lib/db/portal";
import type { JsonObject } from "@/types";

interface CertificateRow { name: string; status: string; href: string }

export default async function Certificates({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireSession();
  const [exAi, partner, { error }] = await Promise.all([exAiBotFor(session.userId), orbitPartnerProgramFor(session.userId), searchParams]);
  const rows: CertificateRow[] = [];
  if (exAi) {
    const { deposits } = parseExAi(exAi);
    for (const deposit of deposits) {
      const certificate = buildExAiCertificateData({ data: exAi, profile: null, claimNumber: null, depositId: depositShortId(deposit) });
      if (certificate) rows.push({ name: "EX-AI Deposit Claim Certificate", status: certificate.status, href: `/claim/certificates/ex-ai/download?id=${certificate.certificateId.replace("EXAI-", "")}` });
    }
  }
  if (partner) {
    const certificate = buildPartnerCertificateData({ data: partner, profile: null, claimNumber: null });
    if (certificate) rows.push({ name: "Partner Balance Claim Certificate", status: certificate.status, href: "/claim/certificates/partner/download" });
  }
  return <div className="layout"><ClaimSidebar active="certificates"/><main className="wrap">
    <header className="topbar"><div><h1>Certificates</h1><p className="subtitle">Your claim certificates — download any of them as a PDF.</p></div></header>
    {error && <p className="alert">⚠️ {error}</p>}
    <section className="card table-card"><table><thead><tr><th>Certificate</th><th>Status</th><th>Download</th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.href}>
        <td><strong>{row.name}</strong></td>
        <td><span className={`badge ${row.status.toLowerCase().includes("waiting") ? "waiting" : row.status.toLowerCase().includes("withdraw") ? "done" : ""}`}>{row.status}</span></td>
        <td><a className="btn ghost" href={row.href}>⇩ Download</a></td>
      </tr>)}
    </tbody></table>{!rows.length && <p className="empty">No certificates yet — sync OrbitOne to generate them.</p>}</section>
  </main></div>;
}
