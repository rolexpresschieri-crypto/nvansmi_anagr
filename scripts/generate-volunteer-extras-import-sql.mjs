import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const csvPath = path.resolve(
  "c:/Users/rronc/nvansmi_anagr/2025 anagrafica volontari NV ANSMI ver011 - REGISTRO SOCI VOLONTARI.csv"
);
const outputPath = path.resolve(
  "c:/Users/rronc/nvansmi_anagr/import_volunteer_extras_from_csv.sql"
);

const COURSES = [
  { code: "LG81_BASE", col: "CORSO BASE LG 81" },
  { code: "ALTO_RISCHIO", col: "CORSO ALTO RISCHIO" },
  { code: "TEORIA_ELI", col: "TEORIA AVV. ELICOTTERO" },
  { code: "PS_OISI", col: "CORSO PRIMO SOCCORSO OISI" },
  { code: "PS_VET", col: "CORSO PRIMO SOCCORSO VET" },
  { code: "PRATICA_ELI", col: "PRATICA AVV. ELICOTTERO" },
  { code: "TLC_PC", col: "CORSO TLC BASE PC" },
  { code: "TLC_NV", col: "CORSO TLC NV ANSMI" },
  { code: "CARTO_GPS", col: "CORSO CARTOGRAFIA & GPS" },
  { code: "ANPAS_OCN", col: "CORSO ANPAS OCN" },
  { code: "ANPAS_ODR", col: "CORSO ANPAS ODR" },
  { code: "DAE", col: "CORSO DAE" },
];

const EQUIPMENT = [
  { code: "TSHIRT", col: "T-SHIRT" },
  { code: "SOFTSHELL", col: "SOFTSHELL" },
  { code: "ANTIPIOGGIA", col: "ANTIPIOGGIA" },
  { code: "ALTA_VIS", col: "ALTA VISIBILITÀ" },
  { code: "GIACCA_MONTURA", col: "GIACCA MONTURA" },
  { code: "CAPPELLO_EST", col: "CAPPELLO ESTIVO" },
  { code: "CAPPELLO_INV", col: "CAPPELLO INVERNALE" },
  { code: "GIACCA_ANPAS", col: "GIACCA ANPAS" },
];

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

const cleanText = (value) => {
  if (value == null) return null;
  const v = value.toString().trim().replace(/\s+/g, " ");
  if (!v || v === "?" || v === "=====" || v === "======") return null;
  return v.toUpperCase();
};

const parseDate = (value) => {
  const v = cleanText(value);
  if (!v) return null;
  if (v === "X" || v === "SI" || v === "NO") return null;
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

const parseCourseCell = (value) => {
  const v = cleanText(value);
  if (!v) return null;
  const date = parseDate(v);
  if (date) return { completion_date: date, passed: true };
  if (v === "X" || v === "SI") return { completion_date: null, passed: true };
  return null;
};

const parseEquipmentSize = (value) => {
  const v = cleanText(value);
  if (!v) return null;
  if (v === "X" || v === "NO") return null;
  return v;
};

const sqlValue = (value) => {
  if (value === null || value === undefined || value === "") return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${String(value).replace(/'/g, "''")}'`;
};

const statements = ["-- Generated from anagrafica CSV (visite, corsi, dotazioni)", "begin;"];
let volunteers = 0;
let medical = 0;
let courses = 0;
let equipment = 0;

for (const row of records) {
  const taxCode = cleanText(get(row, "COD. FISCALE"));
  const lastName = cleanText(get(row, "COGNOME"));
  const firstName = cleanText(get(row, "NOME"));
  if (!taxCode && (!lastName || !firstName)) continue;

  const volunteerWhere = taxCode
    ? `v.tax_code = ${sqlValue(taxCode)}`
    : `upper(v.last_name) = ${sqlValue(lastName)} and upper(v.first_name) = ${sqlValue(firstName)}`;

  volunteers += 1;

  const medicalDate = parseDate(get(row, "DATA VISITA MEDICA"));
  if (medicalDate) {
    statements.push(`
insert into public.medical_checks (volunteer_id, check_date, expiry_date)
select v.id, ${sqlValue(medicalDate)}, (${sqlValue(medicalDate)}::date + interval '12 months')::date
from public.volunteers v
where ${volunteerWhere}
  and not exists (
    select 1 from public.medical_checks mc
    where mc.volunteer_id = v.id and mc.check_date = ${sqlValue(medicalDate)}
  );`);
    medical += 1;
  }

  for (const course of COURSES) {
    const parsed = parseCourseCell(get(row, course.col));
    if (!parsed) continue;
    statements.push(`
insert into public.volunteer_courses (volunteer_id, course_id, completion_date, passed)
select v.id, c.id, ${sqlValue(parsed.completion_date)}, ${sqlValue(parsed.passed)}
from public.volunteers v
cross join public.course_catalog c
where ${volunteerWhere} and c.code = ${sqlValue(course.code)}
on conflict (volunteer_id, course_id) do update set
  completion_date = excluded.completion_date,
  passed = excluded.passed;`);
    courses += 1;
  }

  for (const item of EQUIPMENT) {
    const size = parseEquipmentSize(get(row, item.col));
    if (!size) continue;
    statements.push(`
insert into public.equipment_issues (volunteer_id, item_code, size_value, quantity)
select v.id, ${sqlValue(item.code)}, ${sqlValue(size)}, 1
from public.volunteers v
where ${volunteerWhere}
on conflict (volunteer_id, item_code) do update set
  size_value = excluded.size_value,
  quantity = excluded.quantity;`);
    equipment += 1;
  }
}

statements.push("commit;");
statements.push(`-- Volunteers touched: ${volunteers}`);
statements.push(`-- Medical inserts: ${medical}`);
statements.push(`-- Course upserts: ${courses}`);
statements.push(`-- Equipment upserts: ${equipment}`);

fs.writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
console.log(`Created ${outputPath}`);
console.log({ volunteers, medical, courses, equipment });
