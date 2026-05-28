import type { jsPDF } from "jspdf";

export async function loadLogoDataUrl(): Promise<string | null> {
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

export function drawPdfLogo(doc: jsPDF, logo: string | null): void {
  if (!logo) return;
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(logo, "PNG", pageWidth - 32, 5, 22, 22);
}

export function formatPdfItDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT");
}
