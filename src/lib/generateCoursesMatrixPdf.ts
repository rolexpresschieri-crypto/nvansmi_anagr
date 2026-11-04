import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfLogo, formatPdfItDate, loadLogoDataUrl } from "@/lib/pdfReportUtils";
import type { VolunteerRecord } from "@/lib/volunteerTypes";

export type CourseMatrixColumn = {
  code: string;
  name: string;
  /** Etichetta breve con "\n" per andare a capo nell'intestazione. */
  short: string;
};

/** volunteerId -> courseCode -> data ISO oppure testo (es. "SI"). */
export type CourseCompletionMap = Record<string, Record<string, string>>;

/** Massimo di colonne corso per blocco: oltre, il report continua su una nuova pagina. */
const MAX_COURSES_PER_BLOCK = 18;

const PAGE_MARGIN = 6;
const NAME_WIDTH = 42;

function shortItDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/** Data gg/mm/aa, oppure testo libero, oppure cella vuota. */
export function matrixCellValue(value: string | null | undefined): string {
  if (value == null) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return shortItDate(trimmed);
  return trimmed;
}

function volunteerFullName(volunteer: VolunteerRecord): string {
  return `${volunteer.last_name ?? ""} ${volunteer.first_name ?? ""}`.trim();
}

function fontSizeForWidth(width: number): number {
  if (width >= 17) return 6;
  if (width >= 14) return 5.5;
  if (width >= 11) return 5;
  if (width >= 9) return 4.5;
  return 4;
}

export async function generateCoursesMatrixPdf(
  volunteers: VolunteerRecord[],
  courses: CourseMatrixColumn[],
  completions: CourseCompletionMap,
  filterSummary: string
): Promise<void> {
  const sorted = [...volunteers].sort((a, b) => {
    const byLast = a.last_name.localeCompare(b.last_name, "it");
    if (byLast !== 0) return byLast;
    return a.first_name.localeCompare(b.first_name, "it");
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = new Date();
  const logo = await loadLogoDataUrl();
  const usableWidth = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;

  const blocks: CourseMatrixColumn[][] = [];
  for (let index = 0; index < courses.length; index += MAX_COURSES_PER_BLOCK) {
    blocks.push(courses.slice(index, index + MAX_COURSES_PER_BLOCK));
  }
  if (blocks.length === 0) blocks.push([]);

  blocks.forEach((block, blockIndex) => {
    if (blockIndex > 0) doc.addPage();

    const from = blockIndex * MAX_COURSES_PER_BLOCK + 1;
    const to = from + block.length - 1;
    const blockLabel =
      blocks.length > 1 ? ` (corsi ${from}-${to} di ${courses.length})` : "";

    const drawHeader = () => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`NV ANSMI - Corsi per volontario${blockLabel}`, PAGE_MARGIN, 12);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(filterSummary, PAGE_MARGIN, 17);
      doc.text(
        `Generato: ${formatPdfItDate(today.toISOString().slice(0, 10))} - Data, testo o vuoto`,
        PAGE_MARGIN,
        21
      );
      drawPdfLogo(doc, logo);
    };

    const courseWidth =
      block.length > 0 ? (usableWidth - NAME_WIDTH) / block.length : usableWidth - NAME_WIDTH;
    const bodyFontSize = fontSizeForWidth(courseWidth);
    const headFontSize = Math.max(3.6, bodyFontSize - 0.5);

    const head = [["COGNOME NOME", ...block.map((course) => course.short)]];
    const body = sorted.map((volunteer) => {
      const done = completions[volunteer.id] ?? {};
      return [
        volunteerFullName(volunteer),
        ...block.map((course) => matrixCellValue(done[course.code])),
      ];
    });

    const columnStyles: Record<number, { cellWidth: number; halign?: "center" | "left" }> = {
      0: { cellWidth: NAME_WIDTH, halign: "left" },
    };
    block.forEach((_, index) => {
      columnStyles[index + 1] = { cellWidth: courseWidth, halign: "center" };
    });

    autoTable(doc, {
      startY: 28,
      head,
      body,
      styles: {
        fontSize: bodyFontSize,
        cellPadding: 0.7,
        overflow: "linebreak",
        lineWidth: 0.1,
        valign: "middle",
      },
      headStyles: {
        fillColor: [30, 64, 175],
        fontSize: headFontSize,
        halign: "center",
        valign: "middle",
        cellPadding: 0.7,
      },
      columnStyles,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: 28 },
      tableWidth: usableWidth,
      didDrawPage: () => drawHeader(),
    });
  });

  doc.save(`nvansmi_corsi_volontari_${today.toISOString().slice(0, 10)}.pdf`);
}
