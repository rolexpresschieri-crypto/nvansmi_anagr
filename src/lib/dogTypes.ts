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
