/** Scadenza visita medica = data visita + 12 mesi (stesso giorno, se possibile). */
export function medicalExpiryFromCheckDate(checkDate: string): string {
  const [year, month, day] = checkDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + 12);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatItDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("it-IT");
}

export type MedicalExpiryStatus = "valid" | "warning" | "expired";

const WARNING_DAYS_BEFORE = 15;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Stato scadenza: valida, in allerta (ultimi 15 giorni), scaduta. */
export function getMedicalExpiryStatus(expiryDate: string | null): MedicalExpiryStatus {
  if (!expiryDate) return "valid";

  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(expiryDate));

  if (expiry < today) return "expired";

  const warningStart = new Date(expiry);
  warningStart.setDate(warningStart.getDate() - WARNING_DAYS_BEFORE);
  if (today >= warningStart) return "warning";

  return "valid";
}

export function isMedicalExpired(expiryDate: string | null): boolean {
  return getMedicalExpiryStatus(expiryDate) === "expired";
}

/** Giorni trascorsi dalla scadenza; null se non scaduta o senza data. */
export function daysMedicalExpired(expiryDate: string | null): number | null {
  if (!expiryDate || getMedicalExpiryStatus(expiryDate) !== "expired") return null;

  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(expiryDate));
  const diffMs = today.getTime() - expiry.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
