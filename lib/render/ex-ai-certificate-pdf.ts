import { CERT_COLORS, createCertificateContext, type Cell } from "@/lib/render/certificate-pdf-kit";
import type { CertificateData } from "@/lib/utils/certificate-data";

/** Draws the EX-AI Deposit Claim Certificate as a one-page PDF. */
export async function exAiCertificatePdf(d: CertificateData): Promise<Uint8Array> {
  const { doc, regular, bold, fit, text, center, rule, section, panel, roundedRect, letterhead, footer, pageWidth, margin } = await createCertificateContext(`${d.certificateId} — EX-AI Deposit Claim Certificate`);
  let y = letterhead();
  center("EX-AI Deposit Claim Certificate", y, 19, bold);
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

  section("Deposit summary", y);
  y -= 14;
  panel([
    { label: "Claimable balance", value: d.claimable, weight: 2 },
    { label: "Total deposited", value: d.totalDeposited },
    { label: "Status", value: d.status },
  ], y, 62, true);
  y -= 72;
  panel([
    { label: "Deposit ID", value: d.depositId },
    { label: "Created at", value: d.createdAt, weight: 1.4 },
    { label: "Source", value: d.source },
  ], y, 42);
  y -= 56;

  section("Deposit package — what the deposit is earning at", y);
  y -= 14;
  // Green tier badge on the left, remaining package facts in a panel beside it.
  const rowHeight = 42;
  const badgeWidth = 132;
  roundedRect(margin, y, badgeWidth, rowHeight, 8, CERT_COLORS.green);
  text("PACKAGE TIER", margin + 12, y - 16, 6.5, regular, CERT_COLORS.white);
  const tierSize = fit(d.tier, bold, 14, badgeWidth - 24);
  text(d.tier, margin + 12, y - 16 - tierSize - 5, tierSize, bold, CERT_COLORS.white);
  const restX = margin + badgeWidth + 8;
  const restWidth = pageWidth - margin - restX;
  roundedRect(restX, y, restWidth, rowHeight, 8, CERT_COLORS.panel);
  const restCells: Cell[] = [
    { label: "Earning rate", value: d.earningRate },
    { label: "Compounding", value: d.compounding },
    { label: "Payouts", value: d.payouts },
  ];
  restCells.forEach((cell, index) => {
    const cellX = restX + (restWidth / restCells.length) * index;
    text(cell.label.toUpperCase(), cellX + 12, y - 16, 6.5, regular, CERT_COLORS.muted);
    const size = fit(cell.value, bold, 10.5, restWidth / restCells.length - 24);
    text(cell.value, cellX + 12, y - 16 - size - 6, size, bold, CERT_COLORS.text);
  });
  y -= 56;

  section("Earnings shown on account", y);
  y -= 14;
  panel([
    { label: "Received income", value: d.receivedIncome },
    { label: "Accumulated profit", value: d.accumulatedProfit },
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
