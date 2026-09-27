import { getSession } from "@/lib/auth/session";
import { backofficeProfileFor, exAiBotFor } from "@/lib/db/portal";
import { claimsFor } from "@/services/claim.service";
import { buildExAiCertificateData } from "@/lib/utils/certificate-data";
import { exAiCertificatePdf } from "@/lib/render/ex-ai-certificate-pdf";

export const runtime = "nodejs";

/** Downloads the EX-AI deposit claim certificate as a PDF. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response(null, { status: 302, headers: { Location: "/" } });
  const depositId = new URL(request.url).searchParams.get("id") ?? undefined;
  const [data, profile, claims] = await Promise.all([exAiBotFor(session.userId), backofficeProfileFor(session.userId), claimsFor(session.userId)]);
  if (!data) return new Response(null, { status: 302, headers: { Location: "/claim/certificates?error=No%20EX-AI%20data%20yet%20%E2%80%94%20sync%20OrbitOne%20first." } });
  const certificate = buildExAiCertificateData({ data, profile, claimNumber: claims[0]?.claim_number ?? null, depositId });
  if (!certificate) return new Response(null, { status: 302, headers: { Location: "/claim/certificates?error=That%20deposit%20was%20not%20found." } });
  const pdf = await exAiCertificatePdf(certificate);
  return new Response(Buffer.from(pdf), {
    headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${certificate.certificateId}.pdf"` },
  });
}
