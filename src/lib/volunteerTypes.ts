import { type DogRecord, DOG_SELECT_FIELDS } from "@/lib/dogTypes";

export type { DogRecord };

export type VolunteerRecord = {
  id: string;
  first_name: string;
  last_name: string;
  tax_code: string | null;
  phone: string | null;
  email: string | null;
  qualification: string | null;
  team: string | null;
  member_type: string | null;
  /** F = in formazione, O = operativo, N = non definito */
  operational_status: string | null;
  entry_date: string | null;
  exit_date: string | null;
  ansmi_office: string | null;
  nv_office: string | null;
  pc_insurance: string | null;
  ansmi_card_number: string | null;
  nv_card_number: string | null;
  residence_address: string | null;
  residence_zip: string | null;
  residence_city: string | null;
  residence_province: string | null;
  birth_place: string | null;
  birth_province: string | null;
  birth_date: string | null;
  dogs?: DogRecord[] | null;
  medical_checks?: { check_date: string; expiry_date?: string | null }[] | null;
};

export type VolunteerFormValues = {
  first_name: string;
  last_name: string;
  tax_code: string;
  phone: string;
  email: string;
  member_type: string;
  operational_status: string;
  qualification: string;
  team: string;
  entry_date: string;
  exit_date: string;
  ansmi_office: string;
  nv_office: string;
  pc_insurance: string;
  ansmi_card_number: string;
  nv_card_number: string;
  residence_address: string;
  residence_zip: string;
  residence_city: string;
  residence_province: string;
  birth_place: string;
  birth_province: string;
  birth_date: string;
};

export const VOLUNTEER_SELECT_FIELDS =
  `id, first_name, last_name, tax_code, phone, email, qualification, team, member_type, operational_status, entry_date, exit_date, ansmi_office, nv_office, pc_insurance, ansmi_card_number, nv_card_number, residence_address, residence_zip, residence_city, residence_province, birth_place, birth_province, birth_date, dogs(${DOG_SELECT_FIELDS})`;

export const VOLUNTEER_EXPORT_SELECT_FIELDS =
  "id, first_name, last_name, tax_code, phone, email, qualification, team, member_type, operational_status, entry_date, exit_date, ansmi_office, nv_office, pc_insurance, ansmi_card_number, nv_card_number, residence_address, residence_zip, residence_city, residence_province, birth_place, birth_province, birth_date, medical_checks(check_date, expiry_date)";

export const emptyVolunteerForm = (): VolunteerFormValues => ({
  first_name: "",
  last_name: "",
  tax_code: "",
  phone: "",
  email: "",
  member_type: "",
  operational_status: "N",
  qualification: "",
  team: "",
  entry_date: "",
  exit_date: "",
  ansmi_office: "",
  nv_office: "",
  pc_insurance: "",
  ansmi_card_number: "",
  nv_card_number: "",
  residence_address: "",
  residence_zip: "",
  residence_city: "",
  residence_province: "",
  birth_place: "",
  birth_province: "",
  birth_date: "",
});

export const memberTypeSelectOptions = ["S F", "S F U", "S F V", "S U", "S V", "S V U", "U"];
export const operationalStatusSelectOptions = ["F", "O", "N"] as const;
export type OperationalStatus = (typeof operationalStatusSelectOptions)[number];
export const teamSelectOptions = ["VALSUSA", "VARESE"];
export const qualificationSelectOptions = [
  "ISTR TECH",
  "ODR",
  "SOCIO FONDAT.",
  "UCRS",
  "UCRS ISTR",
];

export const ansmiOfficeOptions = ["CHIANOCCO", "TORINO", "CASTELLAMONTE", "VERRUA"];
export const nvOfficeOptions = ["CHIANOCCO"];

export function isVolunteerActive(volunteer: Pick<VolunteerRecord, "entry_date" | "exit_date">) {
  return Boolean(volunteer.entry_date) && !Boolean(volunteer.exit_date);
}

/** PC sostituito da ODR (dati legacy o CSV). */
export function normalizeQualification(value: string | null | undefined): string {
  if (!value) return "";
  return value === "PC" ? "ODR" : value;
}

export function formatQualification(value: string | null | undefined): string {
  const normalized = normalizeQualification(value);
  return normalized || "-";
}

/** Sempre maiuscolo: F / O / N. Valori vuoti o non riconosciuti -> N. */
export function normalizeOperationalStatus(value: string | null | undefined): OperationalStatus {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "F" || normalized === "O" || normalized === "N") return normalized;
  return "N";
}

export function formatOperationalStatus(value: string | null | undefined): string {
  const status = normalizeOperationalStatus(value);
  if (status === "F") return "F (in formazione)";
  if (status === "O") return "O (operativo)";
  return "N (non definito)";
}

/** Checkbox filtri export (etichette sempre ODR, mai PC). */
export const qualificationFilterOptions = qualificationSelectOptions;

export function volunteerFormFromRecord(volunteer: VolunteerRecord): VolunteerFormValues {
  return {
    first_name: volunteer.first_name ?? "",
    last_name: volunteer.last_name ?? "",
    tax_code: volunteer.tax_code ?? "",
    phone: volunteer.phone ?? "",
    email: volunteer.email ?? "",
    member_type: volunteer.member_type ?? "",
    operational_status: normalizeOperationalStatus(volunteer.operational_status),
    qualification: normalizeQualification(volunteer.qualification),
    team: volunteer.team ?? "",
    entry_date: volunteer.entry_date ?? "",
    exit_date: volunteer.exit_date ?? "",
    ansmi_office: volunteer.ansmi_office ?? "",
    nv_office: volunteer.nv_office ?? "",
    pc_insurance: volunteer.pc_insurance ?? "",
    ansmi_card_number: volunteer.ansmi_card_number ?? "",
    nv_card_number: volunteer.nv_card_number ?? "",
    residence_address: volunteer.residence_address ?? "",
    residence_zip: volunteer.residence_zip ?? "",
    residence_city: volunteer.residence_city ?? "",
    residence_province: volunteer.residence_province ?? "",
    birth_place: volunteer.birth_place ?? "",
    birth_province: volunteer.birth_province ?? "",
    birth_date: volunteer.birth_date ?? "",
  };
}

export function volunteerPayloadFromForm(form: VolunteerFormValues) {
  return {
    first_name: form.first_name.trim() || null,
    last_name: form.last_name.trim() || null,
    tax_code: form.tax_code.trim() || null,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    member_type: form.member_type.trim() || null,
    operational_status: normalizeOperationalStatus(form.operational_status),
    qualification: normalizeQualification(form.qualification.trim()) || null,
    team: form.team.trim() || null,
    entry_date: form.entry_date || null,
    exit_date: form.exit_date || null,
    ansmi_office: form.ansmi_office.trim() || null,
    nv_office: form.nv_office.trim() || null,
    pc_insurance: form.pc_insurance.trim() || null,
    ansmi_card_number: form.ansmi_card_number.trim() || null,
    nv_card_number: form.nv_card_number.trim() || null,
    residence_address: form.residence_address.trim() || null,
    residence_zip: form.residence_zip.trim() || null,
    residence_city: form.residence_city.trim() || null,
    residence_province: form.residence_province.trim() || null,
    birth_place: form.birth_place.trim() || null,
    birth_province: form.birth_province.trim() || null,
    birth_date: form.birth_date || null,
  };
}
