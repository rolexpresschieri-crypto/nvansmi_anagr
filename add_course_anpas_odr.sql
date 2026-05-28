-- Aggiunge corso ANPAS ODR (se il catalogo era già stato creato in precedenza)
insert into public.course_catalog (code, name)
values ('ANPAS_ODR', 'CORSO ANPAS ODR')
on conflict (code) do update set name = excluded.name;
