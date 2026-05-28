-- Scadenza visita medica automatica: check_date + 12 mesi
create or replace function public.set_medical_check_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.check_date is not null then
    new.expiry_date := (new.check_date + interval '12 months')::date;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_medical_check_expiry on public.medical_checks;
create trigger trg_medical_check_expiry
before insert or update of check_date on public.medical_checks
for each row execute function public.set_medical_check_expiry();

-- Allinea record già presenti senza scadenza
update public.medical_checks
set expiry_date = (check_date + interval '12 months')::date
where check_date is not null
  and expiry_date is null;
