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
];

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
