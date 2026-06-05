export type DogRecord = {
  id: string;
  name: string | null;
  breed: string | null;
  sex: "M" | "F" | null;
  microchip: string | null;
  loi_code: string | null;
  pedigree_name: string | null;
  birth_date: string | null;
  enci_booklet_number: string | null;
  enci_propedeutic_exam_date: string | null;
  enci_sup_license: string | null;
  enci_sup_exam_date: string | null;
  enci_mac_license: string | null;
  enci_mac_exam_date: string | null;
  enci_trainer_protocol: string | null;
  enci_trainer_license_date: string | null;
  enci_s2_completed: boolean | null;
  enci_s2_date: string | null;
  anpas_sup_exam_number: string | null;
  anpas_sup_exam_date: string | null;
  anpas_sup_last_renewal_date: string | null;
  anpas_mac_exam_number: string | null;
  anpas_mac_exam_date: string | null;
  anpas_trainer: boolean | null;
  anpas_trainer_protocol: string | null;
  anpas_trainer_license_date: string | null;
  medical_certificate: string | null;
  vaccinations: string | null;
  k9_form_timestamp: string | null;
};

export const DOG_SELECT_FIELDS =
  "id, name, breed, sex, microchip, loi_code, pedigree_name, birth_date, enci_booklet_number, enci_propedeutic_exam_date, enci_sup_license, enci_sup_exam_date, enci_mac_license, enci_mac_exam_date, enci_trainer_protocol, enci_trainer_license_date, enci_s2_completed, enci_s2_date, anpas_sup_exam_number, anpas_sup_exam_date, anpas_sup_last_renewal_date, anpas_mac_exam_number, anpas_mac_exam_date, anpas_trainer, anpas_trainer_protocol, anpas_trainer_license_date, medical_certificate, vaccinations, k9_form_timestamp";

export function formatDogDate(value: string | null | undefined): string {
  if (!value) return "";
  const dateOnly = value.slice(0, 10);
  const d = new Date(dateOnly);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("it-IT");
}

export function formatDogBool(value: boolean | null | undefined): string {
  if (value === true) return "SÌ";
  if (value === false) return "NO";
  return "";
}

export type DogFormValues = {
  name: string;
  breed: string;
  sex: string;
  microchip: string;
  loi_code: string;
  pedigree_name: string;
  birth_date: string;
  enci_booklet_number: string;
  enci_propedeutic_exam_date: string;
  enci_sup_license: string;
  enci_sup_exam_date: string;
  enci_mac_license: string;
  enci_mac_exam_date: string;
  enci_trainer_protocol: string;
  enci_trainer_license_date: string;
  enci_s2_completed: string;
  enci_s2_date: string;
  anpas_sup_exam_number: string;
  anpas_sup_exam_date: string;
  anpas_sup_last_renewal_date: string;
  anpas_mac_exam_number: string;
  anpas_mac_exam_date: string;
  anpas_trainer: string;
  anpas_trainer_protocol: string;
  anpas_trainer_license_date: string;
  medical_certificate: string;
  vaccinations: string;
};

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function parseBoolSelect(value: string): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function boolToSelect(value: boolean | null | undefined): string {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

export const emptyDogForm = (): DogFormValues => ({
  name: "",
  breed: "",
  sex: "",
  microchip: "",
  loi_code: "",
  pedigree_name: "",
  birth_date: "",
  enci_booklet_number: "",
  enci_propedeutic_exam_date: "",
  enci_sup_license: "",
  enci_sup_exam_date: "",
  enci_mac_license: "",
  enci_mac_exam_date: "",
  enci_trainer_protocol: "",
  enci_trainer_license_date: "",
  enci_s2_completed: "",
  enci_s2_date: "",
  anpas_sup_exam_number: "",
  anpas_sup_exam_date: "",
  anpas_sup_last_renewal_date: "",
  anpas_mac_exam_number: "",
  anpas_mac_exam_date: "",
  anpas_trainer: "",
  anpas_trainer_protocol: "",
  anpas_trainer_license_date: "",
  medical_certificate: "",
  vaccinations: "",
});

export function dogFormFromRecord(dog: DogRecord): DogFormValues {
  return {
    name: dog.name ?? "",
    breed: dog.breed ?? "",
    sex: dog.sex ?? "",
    microchip: dog.microchip ?? "",
    loi_code: dog.loi_code ?? "",
    pedigree_name: dog.pedigree_name ?? "",
    birth_date: toDateInput(dog.birth_date),
    enci_booklet_number: dog.enci_booklet_number ?? "",
    enci_propedeutic_exam_date: toDateInput(dog.enci_propedeutic_exam_date),
    enci_sup_license: dog.enci_sup_license ?? "",
    enci_sup_exam_date: toDateInput(dog.enci_sup_exam_date),
    enci_mac_license: dog.enci_mac_license ?? "",
    enci_mac_exam_date: toDateInput(dog.enci_mac_exam_date),
    enci_trainer_protocol: dog.enci_trainer_protocol ?? "",
    enci_trainer_license_date: toDateInput(dog.enci_trainer_license_date),
    enci_s2_completed: boolToSelect(dog.enci_s2_completed),
    enci_s2_date: toDateInput(dog.enci_s2_date),
    anpas_sup_exam_number: dog.anpas_sup_exam_number ?? "",
    anpas_sup_exam_date: toDateInput(dog.anpas_sup_exam_date),
    anpas_sup_last_renewal_date: toDateInput(dog.anpas_sup_last_renewal_date),
    anpas_mac_exam_number: dog.anpas_mac_exam_number ?? "",
    anpas_mac_exam_date: toDateInput(dog.anpas_mac_exam_date),
    anpas_trainer: boolToSelect(dog.anpas_trainer),
    anpas_trainer_protocol: dog.anpas_trainer_protocol ?? "",
    anpas_trainer_license_date: toDateInput(dog.anpas_trainer_license_date),
    medical_certificate: dog.medical_certificate ?? "",
    vaccinations: dog.vaccinations ?? "",
  };
}

function textOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

export function dogPayloadFromForm(form: DogFormValues) {
  return {
    name: textOrNull(form.name),
    breed: textOrNull(form.breed),
    sex: form.sex === "M" || form.sex === "F" ? form.sex : null,
    microchip: textOrNull(form.microchip),
    loi_code: textOrNull(form.loi_code),
    pedigree_name: textOrNull(form.pedigree_name),
    birth_date: form.birth_date || null,
    enci_booklet_number: textOrNull(form.enci_booklet_number),
    enci_propedeutic_exam_date: form.enci_propedeutic_exam_date || null,
    enci_sup_license: textOrNull(form.enci_sup_license),
    enci_sup_exam_date: form.enci_sup_exam_date || null,
    enci_mac_license: textOrNull(form.enci_mac_license),
    enci_mac_exam_date: form.enci_mac_exam_date || null,
    enci_trainer_protocol: textOrNull(form.enci_trainer_protocol),
    enci_trainer_license_date: form.enci_trainer_license_date || null,
    enci_s2_completed: parseBoolSelect(form.enci_s2_completed),
    enci_s2_date: form.enci_s2_date || null,
    anpas_sup_exam_number: textOrNull(form.anpas_sup_exam_number),
    anpas_sup_exam_date: form.anpas_sup_exam_date || null,
    anpas_sup_last_renewal_date: form.anpas_sup_last_renewal_date || null,
    anpas_mac_exam_number: textOrNull(form.anpas_mac_exam_number),
    anpas_mac_exam_date: form.anpas_mac_exam_date || null,
    anpas_trainer: parseBoolSelect(form.anpas_trainer),
    anpas_trainer_protocol: textOrNull(form.anpas_trainer_protocol),
    anpas_trainer_license_date: form.anpas_trainer_license_date || null,
    medical_certificate: textOrNull(form.medical_certificate),
    vaccinations: textOrNull(form.vaccinations),
  };
}
