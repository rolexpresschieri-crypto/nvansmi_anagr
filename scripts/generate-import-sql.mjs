import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const csvPath = path.resolve(
  "c:/Users/rronc/nvansmi_anagr/2025 anagrafica volontari NV ANSMI ver011 - REGISTRO SOCI VOLONTARI.csv"
);
const outputPath = path.resolve("c:/Users/rronc/nvansmi_anagr/import_from_csv.sql");

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
  if (!v || v === "?" || v === "=====" || v === "=======" || v === "======")
    return null;
  return v.toUpperCase();
};

const parseDate = (value) => {
  const v = clean(value);
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

const sqlValue = (value) => {
  if (value === null || value === undefined || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
};

const allowedAnsmi = new Set(["CASTELLAMONTE", "CHIANOCCO", "TORINO", "VERRUA"]);
const allowedNv = new Set(["CHIANOCCO"]);
const allowedTeam = new Set(["VALSUSA", "VARESE"]);
const allowedMemberType = new Set(["S F", "S F U", "S F V", "S U", "S V", "S V U", "U"]);
const allowedQualification = new Set([
  "ISTR TECH",
  "PC",
  "SOCIO FONDAT.",
  "UCRS",
  "UCRS ISTR",
]);
const allowedDogSex = new Set(["M", "F"]);

const statements = [];
statements.push("-- Generated automatically from CSV");
statements.push("begin;");

let volunteersCount = 0;
let dogsCount = 0;

for (const row of records) {
  const regNumberRaw = clean(get(row, "N° Reg."));
  if (!regNumberRaw) continue;
  const regNumber = Number(regNumberRaw.replace(/\D/g, "")) || null;
  if (!regNumber) continue;

  const lastName = clean(get(row, "COGNOME"));
  const firstName = clean(get(row, "NOME"));
  if (!lastName || !firstName) continue;

  const regType = clean(get(row, "Tipo Reg."));
  const status =
    regType === "U" ? "uscito" : regType === "E" ? "attivo" : "sospeso";

  const ansmiOfficeRaw = clean(get(row, "SEDE ANSMI"));
  const nvOfficeRaw = clean(get(row, "SEDE NV ANSMI"));
  const teamRaw = clean(get(row, "SQUADRA"));
  const memberTypeRaw = clean(get(row, "TIPO SOCIO"));
  const qualificationRaw = clean(get(row, "QUALIFICA"));

  const ansmiOffice = allowedAnsmi.has(ansmiOfficeRaw) ? ansmiOfficeRaw : null;
  const nvOffice = allowedNv.has(nvOfficeRaw) ? nvOfficeRaw : null;
  const team = allowedTeam.has(teamRaw) ? teamRaw : null;
  const memberType = allowedMemberType.has(memberTypeRaw) ? memberTypeRaw : null;
  const qualification = allowedQualification.has(qualificationRaw)
    ? qualificationRaw
    : null;

  const taxCode = clean(get(row, "COD. FISCALE"));
  const phone = clean(get(row, "CELLULARE"));
  const email = clean(get(row, "MAIL"))?.toLowerCase() ?? null;

  const volunteerInsert = `
insert into public.volunteers (
  reg_number, reg_type, entry_date, exit_date, status,
  ansmi_office, nv_office, team, member_type, qualification,
  last_name, first_name, tax_code, phone, email,
  residence_address, residence_zip, residence_city, residence_province,
  birth_place, birth_province, birth_date, ansmi_card_number, nv_card_number, pc_insurance
) values (
  ${sqlValue(regNumber)},
  ${sqlValue(regType)},
  ${sqlValue(parseDate(get(row, "DATA ENTRATA")))},
  ${sqlValue(parseDate(get(row, "DATA USCITA")))},
  ${sqlValue(status)},
  ${sqlValue(ansmiOffice)},
  ${sqlValue(nvOffice)},
  ${sqlValue(team)},
  ${sqlValue(memberType)},
  ${sqlValue(qualification)},
  ${sqlValue(lastName)},
  ${sqlValue(firstName)},
  ${sqlValue(taxCode)},
  ${sqlValue(phone)},
  ${sqlValue(email)},
  ${sqlValue(clean(get(row, "RESIDENZA")))},
  ${sqlValue(clean(get(row, "CAP")))},
  ${sqlValue(clean(get(row, "CITTÀ")))},
  ${sqlValue(clean(get(row, "PROV")))},
  ${sqlValue(clean(get(row, "LUOGO DI NASCITA")))},
  ${sqlValue(clean(get(row, "PROV NASCITA")))},
  ${sqlValue(parseDate(get(row, "DATA NASCITA")))},
  ${sqlValue(clean(get(row, "N° TESSERA ANSMI")))},
  ${sqlValue(clean(get(row, "N° TESSERA NV ANSMI")))},
  ${sqlValue(clean(get(row, "ASSICURAZIONE PC")))}
)
on conflict (tax_code) do update set
  reg_number = excluded.reg_number,
  reg_type = excluded.reg_type,
  entry_date = excluded.entry_date,
  exit_date = excluded.exit_date,
  status = excluded.status,
  ansmi_office = excluded.ansmi_office,
  nv_office = excluded.nv_office,
  team = excluded.team,
  member_type = excluded.member_type,
  qualification = excluded.qualification,
  last_name = excluded.last_name,
  first_name = excluded.first_name,
  phone = excluded.phone,
  email = excluded.email,
  residence_address = excluded.residence_address,
  residence_zip = excluded.residence_zip,
  residence_city = excluded.residence_city,
  residence_province = excluded.residence_province,
  birth_place = excluded.birth_place,
  birth_province = excluded.birth_province,
  birth_date = excluded.birth_date,
  ansmi_card_number = excluded.ansmi_card_number,
  nv_card_number = excluded.nv_card_number,
  pc_insurance = excluded.pc_insurance;`;

  statements.push(volunteerInsert);
  volunteersCount += 1;

  const addDog = (suffix) => {
    const breed = clean(get(row, `RAZZA${suffix}`));
    const name = clean(get(row, `NOME PEDIGREE${suffix}`));
    const sexRaw = clean(get(row, `SESSO${suffix}`));
    const microchip = clean(get(row, `MICROCHIP${suffix}`));
    const loi = clean(get(row, `LOI${suffix}`));

    if (!breed && !name && !microchip) return;
    if (!taxCode) return;

    const sex = allowedDogSex.has(sexRaw) ? sexRaw : null;

    const dogInsert = `
insert into public.dogs (
  volunteer_id, name, breed, sex, microchip, loi_code, pedigree_name, birth_date,
  enci_booklet_number, enci_sup_license, enci_mac_license, medical_certificate, vaccinations
)
select
  v.id,
  ${sqlValue(name)},
  ${sqlValue(breed)},
  ${sqlValue(sex)},
  ${sqlValue(microchip)},
  ${sqlValue(loi)},
  ${sqlValue(name)},
  ${sqlValue(parseDate(get(row, `DATA NASCITA${suffix}`)))},
  ${sqlValue(clean(get(row, `N° LIBRETTO ENCI${suffix}`)))},
  ${sqlValue(clean(get(row, `N° BREVETTO ENCI SUP${suffix}`)))},
  ${sqlValue(clean(get(row, `N° BREVETTO ENCI MAC${suffix}`)))},
  ${sqlValue(clean(get(row, "CERTIFICATO MEDICO")))},
  ${sqlValue(clean(get(row, "VACCINAZIONI TETRAVALENTE ANTIRABBICA")))}
from public.volunteers v
where v.tax_code = ${sqlValue(taxCode)}
on conflict (microchip) do update set
  volunteer_id = excluded.volunteer_id,
  name = excluded.name,
  breed = excluded.breed,
  sex = excluded.sex,
  loi_code = excluded.loi_code,
  pedigree_name = excluded.pedigree_name,
  birth_date = excluded.birth_date,
  enci_booklet_number = excluded.enci_booklet_number,
  enci_sup_license = excluded.enci_sup_license,
  enci_mac_license = excluded.enci_mac_license,
  medical_certificate = excluded.medical_certificate,
  vaccinations = excluded.vaccinations;`;

    statements.push(dogInsert);
    dogsCount += 1;
  };

  addDog("1");
  addDog("2");
}

statements.push("commit;");
statements.push(`-- Volunteers processed: ${volunteersCount}`);
statements.push(`-- Dogs processed: ${dogsCount}`);

fs.writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
console.log(`Created ${outputPath}`);
console.log(`Volunteers statements: ${volunteersCount}`);
console.log(`Dogs statements: ${dogsCount}`);
