import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EQUIPMENT_DEFINITIONS } from "@/lib/volunteerCatalog";
import { drawPdfLogo, formatPdfItDate, loadLogoDataUrl } from "@/lib/pdfReportUtils";
import type { VolunteerRecord } from "@/lib/volunteerTypes";

/** volunteerId -> itemCode -> taglia/testo. */
export type EquipmentSizeMap = Record<string, Record<string, string>>;

const PAGE_MARGIN = 6;
const NAME_WIDTH = 42;

function wrapEquipmentLabel(label: string, maxLineChars = 10): string {
  const cleaned = label.trim().toUpperCase().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const lines: string[] = [];
  let current = "";
  for (const word of cleaned.split(" ")) {
    if (!current) {
      current = word;
      continue;
    }
    if (`${current} ${word}`.length <= maxLineChars) current = `${current} ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.join("\n");
}

function volunteerFullName(volunteer: VolunteerRecord): string {
  return `${volunteer.last_name ?? ""} ${volunteer.first_name ?? ""}`.trim();
}

function fontSizeForWidth(width: number): number {
  if (width >= 17) return 6.5;
  if (width >= 14) return 6;
  if (width >= 11) return 5.5;
  if (width >= 9) return 5;
  return 4.5;
}

export async function generateEquipmentMatrixPdf(
  volunteers: VolunteerRecord[],
  sizes: EquipmentSizeMap,
  filterSummary: string
): Promise<void> {
  const sorted = [...volunteers].sort((a, b) => {
    const byLast = a.last_name.localeCompare(b.last_name, "it");
    if (byLast !== 0) return byLast;
    return a.first_name.localeCompare(b.first_name, "it");
  });

  const items = EQUIPMENT_DEFINITIONS.map((item) => ({
    code: item.code,
    short: wrapEquipmentLabel(item.label),
  }));

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = new Date();
  const logo = await loadLogoDataUrl();
  const usableWidth = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const itemWidth =
    items.length > 0 ? (usableWidth - NAME_WIDTH) / items.length : usableWidth - NAME_WIDTH;
  const bodyFontSize = fontSizeForWidth(itemWidth);
  const headFontSize = Math.max(3.8, bodyFontSize - 0.5);

  const drawHeader = () => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("NV ANSMI - Dotazioni per volontario", PAGE_MARGIN, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(filterSummary, PAGE_MARGIN, 17);
    doc.text(
      `Generato: ${formatPdfItDate(today.toISOString().slice(0, 10))} - Taglia/testo o vuoto`,
      PAGE_MARGIN,
      21
    );
    drawPdfLogo(doc, logo);
  };

  const head = [["COGNOME NOME", ...items.map((item) => item.short)]];
  const body = sorted.map((volunteer) => {
    const row = sizes[volunteer.id] ?? {};
    return [
      volunteerFullName(volunteer),
      ...items.map((item) => (row[item.code] ?? "").trim()),
    ];
  });

  const columnStyles: Record<number, { cellWidth: number; halign?: "center" | "left" }> = {
    0: { cellWidth: NAME_WIDTH, halign: "left" },
  };
  items.forEach((_, index) => {
    columnStyles[index + 1] = { cellWidth: itemWidth, halign: "center" };
  });

  autoTable(doc, {
    startY: 28,
    head,
    body,
    styles: {
      fontSize: bodyFontSize,
      cellPadding: 0.8,
      overflow: "linebreak",
      lineWidth: 0.1,
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 64, 175],
      fontSize: headFontSize,
      halign: "center",
      valign: "middle",
      cellPadding: 0.8,
    },
    columnStyles,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: 28 },
    tableWidth: usableWidth,
    didDrawPage: () => drawHeader(),
  });

  doc.save(`nvansmi_dotazioni_${today.toISOString().slice(0, 10)}.pdf`);
}
