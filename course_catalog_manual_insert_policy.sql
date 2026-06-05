-- Consente inserimento corsi manuali nel catalogo (admin / segreteria / istruttore)
drop policy if exists course_catalog_insert_staff on public.course_catalog;
create policy course_catalog_insert_staff
  on public.course_catalog
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'segreteria', 'istruttore')
    )
  );

drop policy if exists course_catalog_update_staff on public.course_catalog;
create policy course_catalog_update_staff
  on public.course_catalog
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'segreteria', 'istruttore')
    )
  );
