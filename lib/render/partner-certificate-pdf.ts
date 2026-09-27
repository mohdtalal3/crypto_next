import { createCertificateContext } from "@/lib/render/certificate-pdf-kit";
import type { PartnerCertificateData } from "@/lib/utils/certificate-data";

/** Draws the Partner Balance Claim Certificate as a one-page PDF. */
export async function partnerCertificatePdf(d: PartnerCertificateData): Promise<Uint8Array> {
  const ctx = await createCertificateContext(`${d.certificateId} — Partner Balance Claim Certificate`);
  const { doc, section, panel, letterhead, center, rule, footer } = ctx;
  let y = letterhead();
  center("Partner Balance Claim Certificate", y, 19, ctx.bold);
  y -= 18;
  rule(y);
  y -= 22;

  section("Member and claim details", y);
  y -= 14;
  panel([
    { label: "Member name", value: d.memberName },
    { label: "Account ID", value: d.accountId },
    { label: "Claim ID", value: d.claimNumber },
    { label: "Claim status", value: d.status },
  ], y, 42);
  y -= 56;

  section("Partner balance summary", y);
  y -= 14;
  panel([
    { label: "Claimable balance", value: d.claimable, weight: 2 },
    { label: "Balance type", value: d.balanceType },
    { label: "Asset", value: d.asset },
  ], y, 62, true);
  y -= 76;

  section("Balance breakdown", y);
  y -= 14;
  panel([
    { label: "Available to withdraw", value: d.available },
    { label: "Used", value: d.used },
  ], y, 42);
  y -= 56;

  section("Recovered account data", y);
  y -= 14;
  panel([
    { label: "Source system", value: d.sourceSystem },
    { label: "Balance category", value: d.balanceCategory },
    { label: "Available status", value: d.availableStatus },
  ], y, 42);
  y -= 56;

  section("Amount presented for claim", y);
  y -= 14;
  panel([
    { label: "Claim asset", value: d.claimAsset },
    { label: "Claimable amount", value: d.claimableAmount, weight: 1.4 },
    { label: "Used amount", value: d.usedAmount },
  ], y, 42);
  y -= 56;

  section("Certificate details", y);
  y -= 14;
  panel([
    { label: "Certificate ID", value: d.certificateId },
    { label: "Generated on", value: d.generatedOn, weight: 1.4 },
    { label: "Asset", value: d.asset },
  ], y, 42);
  y -= 56;
  footer(y);

  return doc.save();
}
