/** Unico utente abilitato alla gestione anagrafica account Auth. */
export const SUPERADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || "rronco23@gmail.com"
)
  .trim()
  .toLowerCase();

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && email.trim().toLowerCase() === SUPERADMIN_EMAIL;
}

export const DEFAULT_USER_PASSWORD = "123456";
