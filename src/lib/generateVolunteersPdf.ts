import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { VolunteerRecord } from "@/lib/volunteerTypes";

const REPORT_COLUMNS: { header: string; key: keyof VolunteerRecord | "extra" }[] = [
  { header: "DATA ENTRATA", key: "entry_date" },
  { header: "DATA USCITA", key: "exit_date" },
  { header: "SEDE ANSMI", key: "ansmi_office" },
  { header: "SEDE NV ANSMI", key: "nv_office" },
  { header: "SQUADRA", key: "team" },
  { header: "TIPO SOCIO", key: "member_type" },
  { header: "QUALIFICA", key: "qualification" },
  { header: "COGNOME", key: "last_name" },
  { header: "NOME", key: "first_name" },
  { header: "ASSICURAZIONE PC", key: "pc_insurance" },
  { header: "N° TESSERA ANSMI", key: "ansmi_card_number" },
  { header: "N° TESSERA NV ANSMI", key: "nv_card_number" },
  { header: "RESIDENZA", key: "residence_address" },
  { header: "CAP", key: "residence_zip" },
  { header: "CITTÀ", key: "residence_city" },
  { header: "PROV", key: "residence_province" },
  { header: "COD. FISCALE", key: "tax_code" },
  { header: "CELLULARE", key: "phone" },
  { header: "MAIL", key: "email" },
  { header: "LUOGO DI NASCITA", key: "birth_place" },
  { header: "PROV NASCITA", key: "birth_province" },
  { header: "DATA NASCITA", key: "birth_date" },
  { header: "ANNO NASCITA", key: "extra" },
  { header: "DATA ODIERNA", key: "extra" },
  { header: "ANNO", key: "extra" },
  { header: "DATA VISITA MEDICA", key: "extra" },
];

function formatItDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT");
}

function latestMedicalDate(volunteer: VolunteerRecord): string {
  const checks = volunteer.medical_checks ?? [];
  if (checks.length === 0) return "";
  const sorted = [...checks].sort(
    (a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
  );
  return formatItDate(sorted[0].check_date);
}

function cellValue(
  volunteer: VolunteerRecord,
  col: (typeof REPORT_COLUMNS)[number],
  today: Date
): string {
  if (col.header === "ANNO NASCITA") {
    if (!volunteer.birth_date) return "";
    const y = new Date(volunteer.birth_date).getFullYear();
    return Number.isNaN(y) ? "" : String(y);
  }
  if (col.header === "DATA ODIERNA") return formatItDate(today.toISOString().slice(0, 10));
  if (col.header === "ANNO") return String(today.getFullYear());
  if (col.header === "DATA VISITA MEDICA") return latestMedicalDate(volunteer);

  if (col.key === "extra") return "";

  const raw = volunteer[col.key as keyof VolunteerRecord];
  if (raw == null) return "";
  if (col.key === "entry_date" || col.key === "exit_date" || col.key === "birth_date") {
    return formatItDate(String(raw));
  }
  return String(raw);
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/logo-nvansmi.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateVolunteersPdf(
  volunteers: VolunteerRecord[],
  filterSummary: string
): Promise<void> {
  const sorted = [...volunteers].sort((a, b) => {
    const byLast = a.last_name.localeCompare(b.last_name, "it");
    if (byLast !== 0) return byLast;
    return a.first_name.localeCompare(b.first_name, "it");
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date();

  const logo = await loadLogoDataUrl();
  const addHeader = () => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("NV ANSMI - Elenco volontari", 10, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(filterSummary, 10, 17);
    doc.text(`Generato: ${formatItDate(today.toISOString().slice(0, 10))}`, 10, 21);
    if (logo) {
      doc.addImage(logo, "PNG", pageWidth - 32, 5, 22, 22);
    }
  };

  addHeader();

  const head = [REPORT_COLUMNS.map((c) => c.header)];
  const body = sorted.map((volunteer) =>
    REPORT_COLUMNS.map((col) => cellValue(volunteer, col, today))
  );

  autoTable(doc, {
    startY: 32,
    head,
    body,
    styles: { fontSize: 5.5, cellPadding: 1, overflow: "linebreak" },
    headStyles: { fillColor: [30, 64, 175], fontSize: 5.5 },
    margin: { left: 8, right: 8 },
    didDrawPage: () => {
      const logoOnPage = logo;
      if (logoOnPage) {
        doc.addImage(logoOnPage, "PNG", pageWidth - 32, 5, 22, 22);
      }
    },
  });

  doc.save(`nvansmi_volontari_${today.toISOString().slice(0, 10)}.pdf`);
}
