import { getSession } from "@/lib/auth/session";
import { backofficeProfileFor, orbitPartnerProgramFor } from "@/lib/db/portal";
import { claimsFor } from "@/services/claim.service";
import { buildPartnerCertificateData } from "@/lib/utils/certificate-data";
import { partnerCertificatePdf } from "@/lib/render/partner-certificate-pdf";

export const runtime = "nodejs";

/** Downloads the Partner Balance claim certificate as a PDF. */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response(null, { status: 302, headers: { Location: "/" } });
  const [data, profile, claims] = await Promise.all([orbitPartnerProgramFor(session.userId), backofficeProfileFor(session.userId), claimsFor(session.userId)]);
  if (!data) return new Response(null, { status: 302, headers: { Location: "/claim/certificates?error=No%20partner%20data%20yet%20%E2%80%94%20sync%20OrbitOne%20first." } });
  const certificate = buildPartnerCertificateData({ data, profile, claimNumber: claims[0]?.claim_number ?? null });
  if (!certificate) return new Response(null, { status: 302, headers: { Location: "/claim/certificates?error=No%20partner%20balance%20found." } });
  const pdf = await partnerCertificatePdf(certificate);
  return new Response(Buffer.from(pdf), {
    headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${certificate.certificateId}.pdf"` },
  });
}
