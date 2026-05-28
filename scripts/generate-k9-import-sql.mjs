import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const csvPath = path.resolve(
  "c:/Users/rronc/nvansmi_anagr/Anagrafica_K9_NVANSMI_K9 - Risposte del modulo 1.csv"
);
const outputPath = path.resolve("c:/Users/rronc/nvansmi_anagr/import_k9_from_csv.sql");

const rawCsv = fs.readFileSync(csvPath, "utf8");
const records = parse(rawCsv, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  trim: false,
});

const normalizedKey = (value) =>
  (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const get = (row, key) => {
  const wanted = normalizedKey(key);
  const found = Object.keys(row).find((k) => normalizedKey(k) === wanted);
  return found ? row[found] : "";
};

const clean = (value) => {
  if (value == null) return null;
  const v = value.toString().trim().replace(/\s+/g, " ");
  if (!v || v === "?" || v === "SI" || v === "NO" || v === "XXXX") return null;
  return v.toUpperCase();
};

const cleanText = (value) => {
  if (value == null) return null;
  const v = value.toString().trim().replace(/\s+/g, " ");
  return v ? v.toUpperCase() : null;
};

const parseDate = (value) => {
  const v = cleanText(value);
  if (!v) return null;
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const dd = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  let yyyy = m[3];
  if (yyyy.length === 2) {
    const yy = Number(yyyy);
    yyyy = String(yy >= 30 ? 1900 + yy : 2000 + yy);
  }
  return `${yyyy}-${mm}-${dd}`;
};

const parseDateTime = (value) => {
  const v = cleanText(value);
  if (!v) return null;
  const m = v.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2})\.(\d{1,2})\.(\d{1,2})$/
  );
  if (!m) return null;
  const dd = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  let yyyy = m[3];
  if (yyyy.length === 2) {
    const yy = Number(yyyy);
    yyyy = String(yy >= 30 ? 1900 + yy : 2000 + yy);
  }
  const hh = m[4].padStart(2, "0");
  const min = m[5].padStart(2, "0");
  const sec = m[6].padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}+01`;
};

const parseBoolean = (value) => {
  const v = cleanText(value);
  if (!v) return null;
  if (v === "SI" || v === "SÌ" || v === "YES" || v === "Y") return true;
  if (v === "NO" || v === "N") return false;
  return null;
};

const normalizeMicrochip = (value) => {
  const v = cleanText(value);
  if (!v) return null;
  const digits = v.replace(/\D/g, "");
  if (digits.length >= 12) return digits;
  return null;
};

const sqlValue = (value) => {
  if (value === null || value === undefined || value === "") return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${String(value).replace(/'/g, "''")}'`;
};

const sqlStatements = [];
sqlStatements.push("-- Generated automatically from K9 CSV");
sqlStatements.push("begin;");

let processed = 0;
let skipped = 0;

for (const row of records) {
  const lastName = cleanText(get(row, "Cognome"));
  const firstName = cleanText(get(row, "Nome"));
  const dogName = cleanText(get(row, "Nome cane (Pedigree)"));
  const breed = cleanText(get(row, "Razza"));

  if (!lastName || !firstName || !dogName) {
    skipped += 1;
    continue;
  }

  const sexRaw = cleanText(get(row, "Sesso"));
  const sex = sexRaw === "M" || sexRaw === "F" ? sexRaw : null;
  const microchip = normalizeMicrochip(get(row, "N° microchip")) ?? normalizeMicrochip(get(row, "Microchip"));
  const loiRaw = cleanText(get(row, "LOI"));
  const loiCode = loiRaw?.replace(/^ROI\s*/i, "").trim() ?? null;

  const statement = `
with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = ${sqlValue(lastName)}
    and upper(v.first_name) = ${sqlValue(firstName)}
  limit 1
),
updated as (
  update public.dogs d
  set
    name = ${sqlValue(dogName)},
    breed = ${sqlValue(breed)},
    sex = ${sqlValue(sex)}::dog_sex_enum,
    microchip = coalesce(${sqlValue(microchip)}, d.microchip),
    loi_code = ${sqlValue(loiCode)},
    pedigree_name = ${sqlValue(dogName)},
    birth_date = ${sqlValue(parseDate(get(row, "Data di nascita")))},
    enci_booklet_number = ${sqlValue(clean(get(row, "N° libretto ENCI")))},
    enci_propedeutic_exam_date = ${sqlValue(parseDate(get(row, "Data esame ENCI - PROPEDEUTICO")))},
    enci_sup_license = ${sqlValue(clean(get(row, "N° brevetto ENCI - SUPERFICIE")))},
    enci_sup_exam_date = ${sqlValue(parseDate(get(row, "Data ottenimento brevetto ENCI - SUPERFICIE")))},
    enci_mac_license = ${sqlValue(clean(get(row, "N° brevetto ENCI - MACERIE")))},
    enci_mac_exam_date = ${sqlValue(parseDate(get(row, "Data ottenimento brevetto ENCI - MACERIE")))},
    enci_trainer_protocol = ${sqlValue(clean(get(row, "Protocollo addestratore ENCI")))},
    enci_trainer_license_date = ${sqlValue(parseDate(get(row, "Data brevetto addestratore ENCI")))},
    enci_s2_completed = ${sqlValue(parseBoolean(get(row, "Corso ENCI S2")))},
    enci_s2_date = ${sqlValue(parseDate(get(row, "Data corso ENCI S2")))},
    anpas_sup_exam_number = ${sqlValue(clean(get(row, "N° brevetto esame ANPAS - SUPERFICIE")))},
    anpas_sup_exam_date = ${sqlValue(parseDate(get(row, "Data esame ANPAS - SUPERFICIE")))},
    anpas_sup_last_renewal_date = ${sqlValue(parseDate(get(row, "Data ultimo rinnovo esame ANPAS - SUPEFICIE")))},
    anpas_mac_exam_number = ${sqlValue(clean(get(row, "N° brevetto esame ANPAS - MACERIE")))},
    anpas_mac_exam_date = ${sqlValue(parseDate(get(row, "Data esame ANPAS - MACERIE")))},
    anpas_trainer = ${sqlValue(parseBoolean(get(row, "ADDESTRATORE ANPAS")))},
    anpas_trainer_protocol = ${sqlValue(clean(get(row, "PROTOCOLLO addestratore ANPAS")))},
    anpas_trainer_license_date = ${sqlValue(parseDate(get(row, "Data brevetto addestratore ANPAS")))},
    k9_form_timestamp = ${sqlValue(parseDateTime(get(row, "Informazioni cronologiche")))}
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      (${sqlValue(microchip)} is not null and d.microchip = ${sqlValue(microchip)})
      or (${sqlValue(microchip)} is null and upper(coalesce(d.name, '')) = ${sqlValue(dogName)})
    )
  returning d.id
)
insert into public.dogs (
  volunteer_id,
  name,
  breed,
  sex,
  microchip,
  loi_code,
  pedigree_name,
  birth_date,
  enci_booklet_number,
  enci_propedeutic_exam_date,
  enci_sup_license,
  enci_sup_exam_date,
  enci_mac_license,
  enci_mac_exam_date,
  enci_trainer_protocol,
  enci_trainer_license_date,
  enci_s2_completed,
  enci_s2_date,
  anpas_sup_exam_number,
  anpas_sup_exam_date,
  anpas_sup_last_renewal_date,
  anpas_mac_exam_number,
  anpas_mac_exam_date,
  anpas_trainer,
  anpas_trainer_protocol,
  anpas_trainer_license_date,
  k9_form_timestamp
)
select
  vm.id,
  ${sqlValue(dogName)},
  ${sqlValue(breed)},
  ${sqlValue(sex)}::dog_sex_enum,
  ${sqlValue(microchip)},
  ${sqlValue(loiCode)},
  ${sqlValue(dogName)},
  ${sqlValue(parseDate(get(row, "Data di nascita")))},
  ${sqlValue(clean(get(row, "N° libretto ENCI")))},
  ${sqlValue(parseDate(get(row, "Data esame ENCI - PROPEDEUTICO")))},
  ${sqlValue(clean(get(row, "N° brevetto ENCI - SUPERFICIE")))},
  ${sqlValue(parseDate(get(row, "Data ottenimento brevetto ENCI - SUPERFICIE")))},
  ${sqlValue(clean(get(row, "N° brevetto ENCI - MACERIE")))},
  ${sqlValue(parseDate(get(row, "Data ottenimento brevetto ENCI - MACERIE")))},
  ${sqlValue(clean(get(row, "Protocollo addestratore ENCI")))},
  ${sqlValue(parseDate(get(row, "Data brevetto addestratore ENCI")))},
  ${sqlValue(parseBoolean(get(row, "Corso ENCI S2")))},
  ${sqlValue(parseDate(get(row, "Data corso ENCI S2")))},
  ${sqlValue(clean(get(row, "N° brevetto esame ANPAS - SUPERFICIE")))},
  ${sqlValue(parseDate(get(row, "Data esame ANPAS - SUPERFICIE")))},
  ${sqlValue(parseDate(get(row, "Data ultimo rinnovo esame ANPAS - SUPEFICIE")))},
  ${sqlValue(clean(get(row, "N° brevetto esame ANPAS - MACERIE")))},
  ${sqlValue(parseDate(get(row, "Data esame ANPAS - MACERIE")))},
  ${sqlValue(parseBoolean(get(row, "ADDESTRATORE ANPAS")))},
  ${sqlValue(clean(get(row, "PROTOCOLLO addestratore ANPAS")))},
  ${sqlValue(parseDate(get(row, "Data brevetto addestratore ANPAS")))},
  ${sqlValue(parseDateTime(get(row, "Informazioni cronologiche")))}
from volunteer_match vm
where not exists (select 1 from updated);`;

  sqlStatements.push(statement);
  processed += 1;
}

sqlStatements.push("commit;");
sqlStatements.push(`-- K9 rows processed: ${processed}`);
sqlStatements.push(`-- K9 rows skipped: ${skipped}`);

fs.writeFileSync(outputPath, `${sqlStatements.join("\n")}\n`, "utf8");
console.log(`Created ${outputPath}`);
console.log(`Processed: ${processed}`);
console.log(`Skipped: ${skipped}`);
