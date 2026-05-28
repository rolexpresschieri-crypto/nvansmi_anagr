import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { daysMedicalExpired, medicalExpiryFromCheckDate } from "@/lib/medicalExpiry";
import { drawPdfLogo, formatPdfItDate, loadLogoDataUrl } from "@/lib/pdfReportUtils";
import type { VolunteerRecord } from "@/lib/volunteerTypes";

type MedicalCheckRow = { check_date: string; expiry_date?: string | null };

function latestMedicalCheck(
  volunteer: VolunteerRecord
): MedicalCheckRow | null {
  const checks = (volunteer.medical_checks ?? []) as MedicalCheckRow[];
  if (checks.length === 0) return null;
  return [...checks].sort(
    (a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
  )[0];
}

function medicalExpiryForCheck(check: MedicalCheckRow): string {
  if (check.expiry_date) return check.expiry_date;
  return medicalExpiryFromCheckDate(check.check_date);
}

export async function generateMedicalVisitsPdf(
  volunteers: VolunteerRecord[],
  filterSummary: string
): Promise<void> {
  const sorted = [...volunteers].sort((a, b) => {
    const byLast = a.last_name.localeCompare(b.last_name, "it");
    if (byLast !== 0) return byLast;
    return a.first_name.localeCompare(b.first_name, "it");
  });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const today = new Date();
  const logo = await loadLogoDataUrl();

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("NV ANSMI - Situazione visite mediche", 10, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(filterSummary, 10, 17);
  doc.text(`Generato: ${formatPdfItDate(today.toISOString().slice(0, 10))}`, 10, 21);
  drawPdfLogo(doc, logo);

  const head = [
    [
      "SQUADRA",
      "COGNOME",
      "NOME",
      "DATA ULTIMA VISITA MEDICA",
      "DATA SCADENZA VISITA MEDICA",
      "VISITA MEDICA SCADUTA DA GG",
    ],
  ];
  const body = sorted.map((volunteer) => {
    const latest = latestMedicalCheck(volunteer);
    const expiryIso = latest ? medicalExpiryForCheck(latest) : null;
    const expiredDays = expiryIso ? daysMedicalExpired(expiryIso) : null;
    return [
      volunteer.team ?? "",
      volunteer.last_name,
      volunteer.first_name,
      latest ? formatPdfItDate(latest.check_date) : "",
      expiryIso ? formatPdfItDate(expiryIso) : "",
      expiredDays != null ? String(expiredDays) : "",
    ];
  });

  autoTable(doc, {
    startY: 28,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175], fontSize: 7 },
    margin: { left: 10, right: 10 },
    didDrawPage: () => drawPdfLogo(doc, logo),
  });

  doc.save(`nvansmi_situazione_visite_mediche_${today.toISOString().slice(0, 10)}.pdf`);
}
