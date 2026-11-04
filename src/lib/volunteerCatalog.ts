export type CourseDefinition = {
  code: string;
  name: string;
  csvColumn: string;
};

export type EquipmentDefinition = {
  code: string;
  label: string;
  csvColumn: string;
};

export const COURSE_DEFINITIONS: CourseDefinition[] = [
  { code: "LG81_BASE", name: "CORSO BASE LG 81", csvColumn: "CORSO BASE LG 81" },
  { code: "ALTO_RISCHIO", name: "CORSO ALTO RISCHIO", csvColumn: "CORSO ALTO RISCHIO" },
  {
    code: "TEORIA_ELI",
    name: "TEORIA AVV. ELICOTTERO",
    csvColumn: "TEORIA AVV. ELICOTTERO",
  },
  {
    code: "PS_OISI",
    name: "CORSO PRIMO SOCCORSO OISI",
    csvColumn: "CORSO PRIMO SOCCORSO OISI",
  },
  {
    code: "PS_VET",
    name: "CORSO PRIMO SOCCORSO VET",
    csvColumn: "CORSO PRIMO SOCCORSO VET",
  },
  {
    code: "PRATICA_ELI",
    name: "PRATICA AVV. ELICOTTERO",
    csvColumn: "PRATICA AVV. ELICOTTERO",
  },
  { code: "TLC_PC", name: "CORSO TLC BASE PC", csvColumn: "CORSO TLC BASE PC" },
  { code: "TLC_NV", name: "CORSO TLC NV ANSMI", csvColumn: "CORSO TLC NV ANSMI" },
  {
    code: "CARTO_GPS",
    name: "CORSO CARTOGRAFIA & GPS",
    csvColumn: "CORSO CARTOGRAFIA & GPS",
  },
  { code: "ANPAS_OCN", name: "CORSO ANPAS OCN", csvColumn: "CORSO ANPAS OCN" },
  { code: "ANPAS_ODR", name: "CORSO ANPAS ODR", csvColumn: "CORSO ANPAS ODR" },
  { code: "DAE", name: "CORSO DAE", csvColumn: "CORSO DAE" },
];

export const PREDEFINED_COURSE_CODES = new Set(
  COURSE_DEFINITIONS.map((course) => course.code)
);

export function normalizeCourseName(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

export function customCourseCodeFromName(name: string): string {
  const normalized = normalizeCourseName(name)
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!normalized) return "";
  return `MAN_${normalized}`.slice(0, 48);
}

export function isPredefinedCourseCode(code: string): boolean {
  return PREDEFINED_COURSE_CODES.has(code);
}

export function predefinedCourseOrder(code: string): number {
  const index = COURSE_DEFINITIONS.findIndex((course) => course.code === code);
  return index === -1 ? COURSE_DEFINITIONS.length : index;
}

/** Etichette corte (con andata a capo) per le colonne dei report orizzontali. */
export const COURSE_SHORT_LABELS: Record<string, string> = {
  LG81_BASE: "BASE\nLG 81",
  ALTO_RISCHIO: "ALTO\nRISCHIO",
  TEORIA_ELI: "TEORIA\nAVV. ELI",
  PS_OISI: "P. SOCC.\nOISI",
  PS_VET: "P. SOCC.\nVET",
  PRATICA_ELI: "PRATICA\nAVV. ELI",
  TLC_PC: "TLC\nBASE PC",
  TLC_NV: "TLC\nNV ANSMI",
  CARTO_GPS: "CARTOGR.\n& GPS",
  ANPAS_OCN: "ANPAS\nOCN",
  ANPAS_ODR: "ANPAS\nODR",
  DAE: "DAE",
};

/** Manda a capo il nome corso su righe brevi, togliendo il prefisso "CORSO". */
export function wrapCourseLabel(name: string, maxLineChars = 9): string {
  const cleaned = normalizeCourseName(name).replace(/^CORSO\s+/, "");
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

export function courseShortLabel(code: string, name: string): string {
  return COURSE_SHORT_LABELS[code] ?? wrapCourseLabel(name);
}

export const EQUIPMENT_DEFINITIONS: EquipmentDefinition[] = [
  { code: "TSHIRT", label: "T-SHIRT", csvColumn: "T-SHIRT" },
  { code: "SOFTSHELL", label: "SOFTSHELL", csvColumn: "SOFTSHELL" },
  { code: "ANTIPIOGGIA", label: "ANTIPIOGGIA", csvColumn: "ANTIPIOGGIA" },
  { code: "ALTA_VIS", label: "ALTA VISIBILITÀ", csvColumn: "ALTA VISIBILITÀ" },
  { code: "GIACCA_MONTURA", label: "GIACCA MONTURA", csvColumn: "GIACCA MONTURA" },
  { code: "CAPPELLO_EST", label: "CAPPELLO ESTIVO", csvColumn: "CAPPELLO ESTIVO" },
  { code: "CAPPELLO_INV", label: "CAPPELLO INVERNALE", csvColumn: "CAPPELLO INVERNALE" },
  { code: "GIACCA_ANPAS", label: "GIACCA ANPAS", csvColumn: "GIACCA ANPAS" },
];
