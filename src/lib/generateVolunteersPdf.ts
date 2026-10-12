import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfLogo, formatPdfItDate, loadLogoDataUrl } from "@/lib/pdfReportUtils";
import type { VolunteerRecord } from "@/lib/volunteerTypes";

const REPORT_COLUMNS: {
  header: string;
  key: keyof VolunteerRecord | "extra";
  align?: "center";
}[] = [
  { header: "DATA\nENTRATA", key: "entry_date", align: "center" },
  { header: "DATA\nUSCITA", key: "exit_date", align: "center" },
  { header: "SEDE\nANSMI", key: "ansmi_office" },
  { header: "SEDE\nNV", key: "nv_office" },
  { header: "SQUADRA", key: "team" },
  { header: "TIPO\nSOCIO", key: "member_type", align: "center" },
  { header: "QUALIFICA", key: "qualification" },
  { header: "COGNOME", key: "last_name" },
  { header: "NOME", key: "first_name" },
  { header: "ASSIC.\nPC", key: "pc_insurance", align: "center" },
  { header: "N°\nTESS.\nANSMI", key: "ansmi_card_number", align: "center" },
  { header: "N°\nTESS.\nNV", key: "nv_card_number", align: "center" },
  { header: "RESIDENZA", key: "residence_address" },
  { header: "CAP", key: "residence_zip", align: "center" },
  { header: "CITTÀ", key: "residence_city" },
  { header: "PROV", key: "residence_province", align: "center" },
  { header: "COD.\nFISCALE", key: "tax_code" },
  { header: "CELLULARE", key: "phone", align: "center" },
  { header: "MAIL", key: "email" },
  { header: "LUOGO\nNASCITA", key: "birth_place" },
  { header: "PROV\nNASC.", key: "birth_province", align: "center" },
  { header: "DATA\nNASCITA", key: "birth_date", align: "center" },
  { header: "DATA\nVISITA\nMEDICA", key: "extra", align: "center" },
];

/** Chiave numerica della data di entrata (YYYY-MM-DD o GG/MM/AAAA). Senza data va in fondo. */
function entryDateKey(value: string | null | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const it = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(value);
  if (it) return Date.UTC(Number(it[3]), Number(it[2]) - 1, Number(it[1]));
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function latestMedicalDate(volunteer: VolunteerRecord): string {
  const checks = volunteer.medical_checks ?? [];
  if (checks.length === 0) return "";
  const sorted = [...checks].sort(
    (a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
  );
  return formatPdfItDate(sorted[0].check_date);
}

function cellValue(
  volunteer: VolunteerRecord,
  col: (typeof REPORT_COLUMNS)[number]
): string {
  if (col.header === "DATA\nVISITA\nMEDICA") return latestMedicalDate(volunteer);

  if (col.key === "extra") return "";

  const raw = volunteer[col.key as keyof VolunteerRecord];
  if (raw == null) return "";
  if (col.key === "entry_date" || col.key === "exit_date" || col.key === "birth_date") {
    return formatPdfItDate(String(raw));
  }
  return String(raw);
}

const SIDE_MARGIN = 6;
/** Il logo è alto 22 mm a partire da y=5: la tabella deve iniziare sotto, su ogni pagina. */
const TABLE_TOP = 34;
const CELL_PADDING = 0.4;
const CELL_SLACK = 0.8;
const FONT_CANDIDATES = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.6];

/** Colonne corte: restano larghe quanto il testo, così date e codici non vanno a capo. */
const FIXED_WIDTH_HEADERS = new Set([
  "DATA\nENTRATA",
  "DATA\nUSCITA",
  "TIPO\nSOCIO",
  "ASSIC.\nPC",
  "N°\nTESS.\nANSMI",
  "N°\nTESS.\nNV",
  "CAP",
  "PROV",
  "PROV\nNASC.",
  "DATA\nNASCITA",
  "DATA\nVISITA\nMEDICA",
]);

function textWidth(doc: jsPDF, text: string, fontSize: number, bold: boolean): number {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(fontSize);
  let widest = 0;
  for (const line of text.split("\n")) {
    widest = Math.max(widest, doc.getTextWidth(line));
  }
  return widest + CELL_PADDING * 2 + CELL_SLACK;
}

function naturalColumnWidths(doc: jsPDF, body: string[][], fontSize: number): number[] {
  const widths = REPORT_COLUMNS.map((col) => textWidth(doc, col.header, fontSize, true));
  for (const row of body) {
    row.forEach((text, index) => {
      widths[index] = Math.max(widths[index], textWidth(doc, text || "", fontSize, false));
    });
  }
  return widths;
}

function fitColumnWidths(natural: number[], usable: number): number[] {
  const total = natural.reduce((sum, width) => sum + width, 0);
  if (total <= usable) return natural;

  const fixed = REPORT_COLUMNS.map((col) => FIXED_WIDTH_HEADERS.has(col.header));
  const fixedSum = natural.reduce((sum, width, index) => sum + (fixed[index] ? width : 0), 0);
  const flexSum = total - fixedSum;
  const room = usable - fixedSum;
  if (room > 0 && flexSum > 0) {
    return natural.map((width, index) => (fixed[index] ? width : (width * room) / flexSum));
  }

  const scale = usable / total;
  return natural.map((width) => width * scale);
}

function fillPageWidth(widths: number[], usable: number): number[] {
  const total = widths.reduce((sum, width) => sum + width, 0);
  if (total <= 0 || total >= usable - 0.5) return widths;
  const extra = usable - total;
  return widths.map((width) => width + (extra * width) / total);
}

export async function generateVolunteersPdf(
  volunteers: VolunteerRecord[],
  filterSummary: string
): Promise<void> {
  const sorted = [...volunteers].sort((a, b) => {
    const byEntry = entryDateKey(a.entry_date) - entryDateKey(b.entry_date);
    if (Number.isFinite(byEntry) && byEntry !== 0) return byEntry;
    const byLast = a.last_name.localeCompare(b.last_name, "it");
    if (byLast !== 0) return byLast;
    return a.first_name.localeCompare(b.first_name, "it");
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = new Date();

  const logo = await loadLogoDataUrl();
  const addHeader = () => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("NV ANSMI - Elenco volontari", 10, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(filterSummary, 10, 17);
    doc.text(
      `Generato: ${formatPdfItDate(today.toISOString().slice(0, 10))} · Ordine: data di entrata, dalla più vecchia`,
      10,
      21
    );
    drawPdfLogo(doc, logo);
  };

  addHeader();

  const head = [REPORT_COLUMNS.map((c) => c.header)];
  const body = sorted.map((volunteer) =>
    REPORT_COLUMNS.map((col) => cellValue(volunteer, col))
  );

  const usable = doc.internal.pageSize.getWidth() - SIDE_MARGIN * 2;
  let fontSize = FONT_CANDIDATES[FONT_CANDIDATES.length - 1];
  let widths = fitColumnWidths(naturalColumnWidths(doc, body, fontSize), usable);
  for (const size of FONT_CANDIDATES) {
    const natural = naturalColumnWidths(doc, body, size);
    if (natural.reduce((sum, width) => sum + width, 0) <= usable) {
      fontSize = size;
      widths = natural;
      break;
    }
  }
  widths = fillPageWidth(widths, usable);

  const columnStyles: Record<
    number,
    { cellWidth: number; overflow: "hidden"; halign?: "center" }
  > = {};
  widths.forEach((width, index) => {
    columnStyles[index] = {
      cellWidth: width,
      overflow: "hidden",
      halign: REPORT_COLUMNS[index].align,
    };
  });

  autoTable(doc, {
    startY: TABLE_TOP,
    head,
    body,
    styles: {
      fontSize,
      cellPadding: CELL_PADDING,
      overflow: "hidden",
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 64, 175],
      fontSize,
      overflow: "linebreak",
      halign: "center",
      valign: "middle",
    },
    columnStyles,
    tableWidth: widths.reduce((sum, width) => sum + width, 0),
    margin: { left: SIDE_MARGIN, right: SIDE_MARGIN, top: TABLE_TOP },
    didDrawPage: () => drawPdfLogo(doc, logo),
  });

  doc.save(`nvansmi_volontari_${today.toISOString().slice(0, 10)}.pdf`);
}
