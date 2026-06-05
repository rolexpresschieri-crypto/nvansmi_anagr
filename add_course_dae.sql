-- Aggiunge corso DAE (se il catalogo era già stato creato in precedenza)
insert into public.course_catalog (code, name)
values ('DAE', 'CORSO DAE')
on conflict (code) do update set name = excluded.name;
