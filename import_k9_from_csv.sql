-- Generated automatically from K9 CSV
begin;

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'AUSILI'
    and upper(v.first_name) = 'SERGIO'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'SHOSANNA DREYFUS INGLORIUS BASTERD',
    breed = 'PASTORE OLANDESE',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce('380260101367286', d.microchip),
    loi_code = '19112316',
    pedigree_name = 'SHOSANNA DREYFUS INGLORIUS BASTERD',
    birth_date = '2019-05-01',
    enci_booklet_number = '247726',
    enci_propedeutic_exam_date = '2020-09-19',
    enci_sup_license = '02892',
    enci_sup_exam_date = '2024-06-22',
    enci_mac_license = '2444',
    enci_mac_exam_date = '2022-11-19',
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = '2018-03-25',
    enci_s2_completed = TRUE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-13 20:04:05+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260101367286' is not null and d.microchip = '380260101367286')
      or ('380260101367286' is null and upper(coalesce(d.name, '')) = 'SHOSANNA DREYFUS INGLORIUS BASTERD')
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
  'SHOSANNA DREYFUS INGLORIUS BASTERD',
  'PASTORE OLANDESE',
  'F'::dog_sex_enum,
  '380260101367286',
  '19112316',
  'SHOSANNA DREYFUS INGLORIUS BASTERD',
  '2019-05-01',
  '247726',
  '2020-09-19',
  '02892',
  '2024-06-22',
  '2444',
  '2022-11-19',
  NULL,
  '2018-03-25',
  TRUE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-13 20:04:05+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'AUSILI'
    and upper(v.first_name) = 'SERGIO'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'SHOSANNA DREYFUS INGLORIUS BASTARD',
    breed = 'PASTORE OLANDESE',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce('380260101367286', d.microchip),
    loi_code = '19112316',
    pedigree_name = 'SHOSANNA DREYFUS INGLORIUS BASTARD',
    birth_date = '2019-05-01',
    enci_booklet_number = '247726',
    enci_propedeutic_exam_date = '2020-09-19',
    enci_sup_license = '02892',
    enci_sup_exam_date = '2024-06-21',
    enci_mac_license = '2444',
    enci_mac_exam_date = '2022-11-19',
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = '2018-03-25',
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-15 16:41:50+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260101367286' is not null and d.microchip = '380260101367286')
      or ('380260101367286' is null and upper(coalesce(d.name, '')) = 'SHOSANNA DREYFUS INGLORIUS BASTARD')
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
  'SHOSANNA DREYFUS INGLORIUS BASTARD',
  'PASTORE OLANDESE',
  'F'::dog_sex_enum,
  '380260101367286',
  '19112316',
  'SHOSANNA DREYFUS INGLORIUS BASTARD',
  '2019-05-01',
  '247726',
  '2020-09-19',
  '02892',
  '2024-06-21',
  '2444',
  '2022-11-19',
  NULL,
  '2018-03-25',
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-15 16:41:50+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'AUSILI'
    and upper(v.first_name) = 'SERGIO'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'CODY',
    breed = 'METICCIO',
    sex = 'M'::dog_sex_enum,
    microchip = coalesce('380260002001774', d.microchip),
    loi_code = NULL,
    pedigree_name = 'CODY',
    birth_date = '2013-01-10',
    enci_booklet_number = '154793',
    enci_propedeutic_exam_date = NULL,
    enci_sup_license = '1153',
    enci_sup_exam_date = '2016-06-25',
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = '2018-03-25',
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-15 16:47:22+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260002001774' is not null and d.microchip = '380260002001774')
      or ('380260002001774' is null and upper(coalesce(d.name, '')) = 'CODY')
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
  'CODY',
  'METICCIO',
  'M'::dog_sex_enum,
  '380260002001774',
  NULL,
  'CODY',
  '2013-01-10',
  '154793',
  NULL,
  '1153',
  '2016-06-25',
  NULL,
  NULL,
  NULL,
  '2018-03-25',
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-15 16:47:22+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'CHECCHI'
    and upper(v.first_name) = 'CLAUDIA'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'ONE MORE TRY',
    breed = 'LABRADOR RETRIVER',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce('380260043746672', d.microchip),
    loi_code = '19/45979',
    pedigree_name = 'ONE MORE TRY',
    birth_date = '2018-12-16',
    enci_booklet_number = '250682',
    enci_propedeutic_exam_date = '2021-06-25',
    enci_sup_license = '02895',
    enci_sup_exam_date = '2024-06-22',
    enci_mac_license = '1801',
    enci_mac_exam_date = '2021-06-25',
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-14 09:02:51+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260043746672' is not null and d.microchip = '380260043746672')
      or ('380260043746672' is null and upper(coalesce(d.name, '')) = 'ONE MORE TRY')
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
  'ONE MORE TRY',
  'LABRADOR RETRIVER',
  'F'::dog_sex_enum,
  '380260043746672',
  '19/45979',
  'ONE MORE TRY',
  '2018-12-16',
  '250682',
  '2021-06-25',
  '02895',
  '2024-06-22',
  '1801',
  '2021-06-25',
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-14 09:02:51+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'CHECCHI'
    and upper(v.first_name) = 'CLAUDIA'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'LEXUS',
    breed = 'BORDER COLLIE',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce('380260102373965', d.microchip),
    loi_code = '2359640',
    pedigree_name = 'LEXUS',
    birth_date = '2023-02-12',
    enci_booklet_number = '307529',
    enci_propedeutic_exam_date = '2025-08-03',
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = '03130',
    enci_mac_exam_date = '2026-02-07',
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-14 10:52:29+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260102373965' is not null and d.microchip = '380260102373965')
      or ('380260102373965' is null and upper(coalesce(d.name, '')) = 'LEXUS')
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
  'LEXUS',
  'BORDER COLLIE',
  'F'::dog_sex_enum,
  '380260102373965',
  '2359640',
  'LEXUS',
  '2023-02-12',
  '307529',
  '2025-08-03',
  NULL,
  NULL,
  '03130',
  '2026-02-07',
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-14 10:52:29+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'FERRUA'
    and upper(v.first_name) = 'ALESSANDRA'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'UPE',
    breed = 'PASTORE AUSTRALIANO',
    sex = 'M'::dog_sex_enum,
    microchip = coalesce('380260140341790', d.microchip),
    loi_code = NULL,
    pedigree_name = 'UPE',
    birth_date = '2024-06-22',
    enci_booklet_number = NULL,
    enci_propedeutic_exam_date = NULL,
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-12 18:11:35+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260140341790' is not null and d.microchip = '380260140341790')
      or ('380260140341790' is null and upper(coalesce(d.name, '')) = 'UPE')
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
  'UPE',
  'PASTORE AUSTRALIANO',
  'M'::dog_sex_enum,
  '380260140341790',
  NULL,
  'UPE',
  '2024-06-22',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-12 18:11:35+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'FURLAN'
    and upper(v.first_name) = 'ENRICO'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'GEBO',
    breed = 'BORDER COLLIE',
    sex = 'M'::dog_sex_enum,
    microchip = coalesce('380260120170255', d.microchip),
    loi_code = NULL,
    pedigree_name = 'GEBO',
    birth_date = '2021-03-26',
    enci_booklet_number = NULL,
    enci_propedeutic_exam_date = NULL,
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-13 15:09:13+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260120170255' is not null and d.microchip = '380260120170255')
      or ('380260120170255' is null and upper(coalesce(d.name, '')) = 'GEBO')
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
  'GEBO',
  'BORDER COLLIE',
  'M'::dog_sex_enum,
  '380260120170255',
  NULL,
  'GEBO',
  '2021-03-26',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-13 15:09:13+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'GORLIER'
    and upper(v.first_name) = 'FEDERICA'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'ZAIS GOLDEN DI CASA GORENA',
    breed = 'GOLDEN RETRIEVER',
    sex = 'M'::dog_sex_enum,
    microchip = coalesce('380260120023585', d.microchip),
    loi_code = '24/54855',
    pedigree_name = 'ZAIS GOLDEN DI CASA GORENA',
    birth_date = '2024-02-07',
    enci_booklet_number = '284062',
    enci_propedeutic_exam_date = '2025-10-11',
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-14 08:57:50+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260120023585' is not null and d.microchip = '380260120023585')
      or ('380260120023585' is null and upper(coalesce(d.name, '')) = 'ZAIS GOLDEN DI CASA GORENA')
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
  'ZAIS GOLDEN DI CASA GORENA',
  'GOLDEN RETRIEVER',
  'M'::dog_sex_enum,
  '380260120023585',
  '24/54855',
  'ZAIS GOLDEN DI CASA GORENA',
  '2024-02-07',
  '284062',
  '2025-10-11',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-14 08:57:50+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'IMPERATRICE'
    and upper(v.first_name) = 'GIAN FRANCO'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'HINCKLEY',
    breed = 'GOLDEN RETRIEVER',
    sex = 'M'::dog_sex_enum,
    microchip = coalesce('380260120150317', d.microchip),
    loi_code = '19/167435',
    pedigree_name = 'HINCKLEY',
    birth_date = '2019-07-06',
    enci_booklet_number = '258200',
    enci_propedeutic_exam_date = '2022-06-24',
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-14 14:27:07+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260120150317' is not null and d.microchip = '380260120150317')
      or ('380260120150317' is null and upper(coalesce(d.name, '')) = 'HINCKLEY')
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
  'HINCKLEY',
  'GOLDEN RETRIEVER',
  'M'::dog_sex_enum,
  '380260120150317',
  '19/167435',
  'HINCKLEY',
  '2019-07-06',
  '258200',
  '2022-06-24',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-14 14:27:07+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'LAMI'
    and upper(v.first_name) = 'SIMONA'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'TEQUILA DI CASA NOSELLA',
    breed = 'PASTORE TEDESCO',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce('380260044876122', d.microchip),
    loi_code = 'LO2334146',
    pedigree_name = 'TEQUILA DI CASA NOSELLA',
    birth_date = '2022-12-05',
    enci_booklet_number = '290229',
    enci_propedeutic_exam_date = '2024-10-25',
    enci_sup_license = '03151',
    enci_sup_exam_date = '2025-10-12',
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-13 21:21:18+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260044876122' is not null and d.microchip = '380260044876122')
      or ('380260044876122' is null and upper(coalesce(d.name, '')) = 'TEQUILA DI CASA NOSELLA')
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
  'TEQUILA DI CASA NOSELLA',
  'PASTORE TEDESCO',
  'F'::dog_sex_enum,
  '380260044876122',
  'LO2334146',
  'TEQUILA DI CASA NOSELLA',
  '2022-12-05',
  '290229',
  '2024-10-25',
  '03151',
  '2025-10-12',
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-13 21:21:18+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'LAMI'
    and upper(v.first_name) = 'SIMONA'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'GELPBLU',
    breed = 'BORDER COLLIE',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce('380260004315897', d.microchip),
    loi_code = 'LO20156522',
    pedigree_name = 'GELPBLU',
    birth_date = '2020-09-05',
    enci_booklet_number = '287339',
    enci_propedeutic_exam_date = '2022-11-12',
    enci_sup_license = '2739',
    enci_sup_exam_date = '2023-05-27',
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-14 19:38:48+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260004315897' is not null and d.microchip = '380260004315897')
      or ('380260004315897' is null and upper(coalesce(d.name, '')) = 'GELPBLU')
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
  'GELPBLU',
  'BORDER COLLIE',
  'F'::dog_sex_enum,
  '380260004315897',
  'LO20156522',
  'GELPBLU',
  '2020-09-05',
  '287339',
  '2022-11-12',
  '2739',
  '2023-05-27',
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-14 19:38:48+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'LORENZALE'
    and upper(v.first_name) = 'CARLO'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'O’ SARABI DEGLI ACERI ROSSI',
    breed = 'PASTORE BELGA MALINOIS',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce('380260120194295', d.microchip),
    loi_code = NULL,
    pedigree_name = 'O’ SARABI DEGLI ACERI ROSSI',
    birth_date = '2023-12-15',
    enci_booklet_number = '320830',
    enci_propedeutic_exam_date = '2025-10-11',
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = '2023-10-08',
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-14 14:09:23+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260120194295' is not null and d.microchip = '380260120194295')
      or ('380260120194295' is null and upper(coalesce(d.name, '')) = 'O’ SARABI DEGLI ACERI ROSSI')
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
  'O’ SARABI DEGLI ACERI ROSSI',
  'PASTORE BELGA MALINOIS',
  'F'::dog_sex_enum,
  '380260120194295',
  NULL,
  'O’ SARABI DEGLI ACERI ROSSI',
  '2023-12-15',
  '320830',
  '2025-10-11',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '2023-10-08',
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-14 14:09:23+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'MALETTO'
    and upper(v.first_name) = 'DANIELE'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'MILLA',
    breed = 'LUPOIDE. METICCIO',
    sex = 'F'::dog_sex_enum,
    microchip = coalesce(NULL, d.microchip),
    loi_code = NULL,
    pedigree_name = 'MILLA',
    birth_date = '2023-06-17',
    enci_booklet_number = NULL,
    enci_propedeutic_exam_date = NULL,
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = NULL,
    enci_trainer_license_date = NULL,
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-13 15:21:17+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      (NULL is not null and d.microchip = NULL)
      or (NULL is null and upper(coalesce(d.name, '')) = 'MILLA')
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
  'MILLA',
  'LUPOIDE. METICCIO',
  'F'::dog_sex_enum,
  NULL,
  NULL,
  'MILLA',
  '2023-06-17',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-13 15:21:17+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'RONCO'
    and upper(v.first_name) = 'ROBERTO'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'WARM INDIAN CHINOOK',
    breed = 'GOLDEN RETRIEVER',
    sex = 'M'::dog_sex_enum,
    microchip = coalesce('380260080302018', d.microchip),
    loi_code = '15/68863',
    pedigree_name = 'WARM INDIAN CHINOOK',
    birth_date = '2015-03-15',
    enci_booklet_number = '184577',
    enci_propedeutic_exam_date = NULL,
    enci_sup_license = '1213',
    enci_sup_exam_date = NULL,
    enci_mac_license = '2432',
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = '11882',
    enci_trainer_license_date = '2017-03-27',
    enci_s2_completed = TRUE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = '2024-12-14',
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-26 15:55:29+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260080302018' is not null and d.microchip = '380260080302018')
      or ('380260080302018' is null and upper(coalesce(d.name, '')) = 'WARM INDIAN CHINOOK')
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
  'WARM INDIAN CHINOOK',
  'GOLDEN RETRIEVER',
  'M'::dog_sex_enum,
  '380260080302018',
  '15/68863',
  'WARM INDIAN CHINOOK',
  '2015-03-15',
  '184577',
  NULL,
  '1213',
  NULL,
  '2432',
  NULL,
  '11882',
  '2017-03-27',
  TRUE,
  NULL,
  NULL,
  '2024-12-14',
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-26 15:55:29+01'
from volunteer_match vm
where not exists (select 1 from updated);

with volunteer_match as (
  select v.id
  from public.volunteers v
  where upper(v.last_name) = 'ZANELLATO'
    and upper(v.first_name) = 'IRENE'
  limit 1
),
updated as (
  update public.dogs d
  set
    name = 'RAGNAROK',
    breed = 'PASTORE BELGA MALINOIS',
    sex = 'M'::dog_sex_enum,
    microchip = coalesce('380260120024837', d.microchip),
    loi_code = 'LO23108418',
    pedigree_name = 'RAGNAROK',
    birth_date = '2023-04-25',
    enci_booklet_number = '283528',
    enci_propedeutic_exam_date = '2025-10-11',
    enci_sup_license = NULL,
    enci_sup_exam_date = NULL,
    enci_mac_license = NULL,
    enci_mac_exam_date = NULL,
    enci_trainer_protocol = '9870627',
    enci_trainer_license_date = '2023-10-08',
    enci_s2_completed = FALSE,
    enci_s2_date = NULL,
    anpas_sup_exam_number = NULL,
    anpas_sup_exam_date = NULL,
    anpas_sup_last_renewal_date = NULL,
    anpas_mac_exam_number = NULL,
    anpas_mac_exam_date = NULL,
    anpas_trainer = FALSE,
    anpas_trainer_protocol = NULL,
    anpas_trainer_license_date = NULL,
    k9_form_timestamp = '2026-01-14 14:01:13+01'
  from volunteer_match vm
  where d.volunteer_id = vm.id
    and (
      ('380260120024837' is not null and d.microchip = '380260120024837')
      or ('380260120024837' is null and upper(coalesce(d.name, '')) = 'RAGNAROK')
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
  'RAGNAROK',
  'PASTORE BELGA MALINOIS',
  'M'::dog_sex_enum,
  '380260120024837',
  'LO23108418',
  'RAGNAROK',
  '2023-04-25',
  '283528',
  '2025-10-11',
  NULL,
  NULL,
  NULL,
  NULL,
  '9870627',
  '2023-10-08',
  FALSE,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL,
  NULL,
  '2026-01-14 14:01:13+01'
from volunteer_match vm
where not exists (select 1 from updated);
commit;
-- K9 rows processed: 15
-- K9 rows skipped: 0
