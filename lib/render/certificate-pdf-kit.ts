import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { logoBase64 } from "@/lib/assets/logo";

export const CERT_COLORS = {
  navy: rgb(0.07, 0.23, 0.36),
  green: rgb(0.05, 0.48, 0.31),
  gold: rgb(0.79, 0.63, 0.29),
  panel: rgb(0.93, 0.95, 0.96),
  muted: rgb(0.36, 0.42, 0.48),
  text: rgb(0.07, 0.16, 0.24),
  white: rgb(1, 1, 1),
  sky: rgb(0.62, 0.76, 0.88),
};

export const CERT_PAGE = { width: 595.28, height: 841.89, margin: 48 };

export interface Cell { label: string; value: string; weight?: number }

/** Creates a one-page A4 certificate document with shared fonts, logo, and drawing helpers. */
export async function createCertificateContext(title: string) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor("D.A.R.A. | Digital Asset Recovery Alliance");
  const page = doc.addPage([CERT_PAGE.width, CERT_PAGE.height]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(Buffer.from(logoBase64, "base64"));

  const fit = (value: string, font: typeof regular, size: number, maxWidth: number) => {
    let current = size;
    while (current > 6 && font.widthOfTextAtSize(value, current) > maxWidth) current -= 0.5;
    return current;
  };
  const text = (value: string, x: number, y: number, size: number, font = regular, color = CERT_COLORS.text) =>
    page.drawText(value, { x, y, size, font, color });
  const center = (value: string, y: number, size: number, font = regular, color = CERT_COLORS.text) => {
    const width = font.widthOfTextAtSize(value, size);
    page.drawText(value, { x: (CERT_PAGE.width - width) / 2, y, size, font, color });
  };
  const rule = (y: number, color = CERT_COLORS.gold, thick = 1.6) =>
    page.drawLine({ start: { x: CERT_PAGE.margin, y }, end: { x: CERT_PAGE.width - CERT_PAGE.margin, y }, thickness: thick, color });
  const section = (title: string, y: number) => page.drawText(title.toUpperCase(), { x: CERT_PAGE.margin, y, size: 8.5, font: bold, color: CERT_COLORS.green });
  /** Rounded rectangle with its top edge at yTop (PDF coords), extending downward. */
  const roundedRect = (x: number, yTop: number, width: number, height: number, radius: number, color = CERT_COLORS.panel) => {
    const w = width, h = height, r = Math.min(radius, width / 2, height / 2);
    const path = `M 0 ${r} Q 0 0 ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} Z`;
    page.drawSvgPath(path, { x, y: yTop, color });
  };
  const panel = (cells: Cell[], y: number, height: number, dark = false) => {
    const total = cells.reduce((sum, cell) => sum + (cell.weight ?? 1), 0);
    const boxWidth = CERT_PAGE.width - CERT_PAGE.margin * 2;
    roundedRect(CERT_PAGE.margin, y, boxWidth, height, 8, dark ? CERT_COLORS.navy : CERT_COLORS.panel);
    let x = CERT_PAGE.margin;
    for (const cell of cells) {
      const cellWidth = boxWidth * (cell.weight ?? 1) / total;
      const big = dark && (cell.weight ?? 1) >= 2;
      page.drawText(cell.label.toUpperCase(), { x: x + 12, y: y - 16, size: 6.5, font: regular, color: dark ? CERT_COLORS.sky : CERT_COLORS.muted });
      const valueSize = fit(cell.value, bold, big ? 20 : 10.5, cellWidth - 24);
      page.drawText(cell.value, { x: x + 12, y: y - 16 - valueSize - 6, size: valueSize, font: bold, color: dark ? CERT_COLORS.white : CERT_COLORS.text });
      x += cellWidth;
    }
  };
  const letterhead = () => {
    const logoWidth = 150;
    const logoHeight = logoWidth * logo.height / logo.width;
    const bandHeight = logoHeight + 30;
    page.drawRectangle({ x: 0, y: CERT_PAGE.height - CERT_PAGE.margin - bandHeight, width: CERT_PAGE.width, height: bandHeight, color: CERT_COLORS.navy });
    page.drawImage(logo, { x: (CERT_PAGE.width - logoWidth) / 2, y: CERT_PAGE.height - CERT_PAGE.margin - logoHeight - 15, width: logoWidth, height: logoHeight });
    return CERT_PAGE.height - CERT_PAGE.margin - bandHeight - 26;
  };
  const footer = (y: number) => {
    rule(y);
    page.drawText("D.A.R.A. | DIGITAL ASSET RECOVERY ALLIANCE", { x: CERT_PAGE.margin, y: y - 22, size: 8, font: bold, color: CERT_COLORS.text });
    const brand = "CAPTURE · CLAIM · CREDIT";
    page.drawText(brand, { x: CERT_PAGE.width - CERT_PAGE.margin - bold.widthOfTextAtSize(brand, 8), y: y - 22, size: 8, font: bold, color: CERT_COLORS.green });
  };

  return { doc, page, regular, bold, logo, fit, text, center, rule, section, panel, roundedRect, letterhead, footer, pageWidth: CERT_PAGE.width, pageHeight: CERT_PAGE.height, margin: CERT_PAGE.margin };
}
