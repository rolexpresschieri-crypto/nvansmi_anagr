-- Catalogo corsi + indice unico dotazioni per volontario
insert into public.course_catalog (code, name) values
  ('LG81_BASE', 'CORSO BASE LG 81'),
  ('ALTO_RISCHIO', 'CORSO ALTO RISCHIO'),
  ('TEORIA_ELI', 'TEORIA AVV. ELICOTTERO'),
  ('PS_OISI', 'CORSO PRIMO SOCCORSO OISI'),
  ('PS_VET', 'CORSO PRIMO SOCCORSO VET'),
  ('PRATICA_ELI', 'PRATICA AVV. ELICOTTERO'),
  ('TLC_PC', 'CORSO TLC BASE PC'),
  ('TLC_NV', 'CORSO TLC NV ANSMI'),
  ('CARTO_GPS', 'CORSO CARTOGRAFIA & GPS'),
  ('ANPAS_OCN', 'CORSO ANPAS OCN'),
  ('ANPAS_ODR', 'CORSO ANPAS ODR')
on conflict (code) do update set name = excluded.name;

create unique index if not exists equipment_issues_volunteer_item_uidx
  on public.equipment_issues (volunteer_id, item_code);
