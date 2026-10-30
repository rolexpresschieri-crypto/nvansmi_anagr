-- Stato operativo volontario (regolamento): F = in formazione, O = operativo, N = non definito
alter table public.volunteers
  add column if not exists operational_status text;

update public.volunteers
set operational_status = 'N'
where operational_status is null
   or btrim(operational_status) = '';

update public.volunteers
set operational_status = upper(btrim(operational_status))
where operational_status is not null;

alter table public.volunteers
  alter column operational_status set default 'N';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'volunteers_operational_status_check'
  ) then
    alter table public.volunteers
      add constraint volunteers_operational_status_check
      check (operational_status in ('F', 'O', 'N'));
  end if;
end $$;
