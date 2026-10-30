-- Audit trail: ogni modifica dati + eventi applicativi (LOGIN/LOGOUT)
-- Eseguire in Supabase SQL Editor.

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  action text not null,
  table_name text,
  record_id text,
  summary text,
  old_data jsonb,
  new_data jsonb
);

create index if not exists audit_log_occurred_at_idx
  on public.audit_log (occurred_at desc);

create index if not exists audit_log_actor_id_idx
  on public.audit_log (actor_id);

create index if not exists audit_log_table_name_idx
  on public.audit_log (table_name);

alter table public.audit_log enable row level security;

drop policy if exists audit_log_select_staff on public.audit_log;
create policy audit_log_select_staff
  on public.audit_log
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'segreteria')
    )
  );

-- Nessuna insert/update/delete diretta dai client: solo trigger e RPC security definer.

create or replace function public.audit_actor_email(p_actor uuid)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select email from auth.users where id = p_actor;
$$;

create or replace function public.audit_record_id(p_row jsonb)
returns text
language plpgsql
immutable
as $$
begin
  if p_row ? 'id' then
    return p_row->>'id';
  end if;
  if p_row ? 'volunteer_id' and p_row ? 'course_id' then
    return (p_row->>'volunteer_id') || ':' || (p_row->>'course_id');
  end if;
  return null;
end;
$$;

create or replace function public.audit_row_summary(
  p_action text,
  p_table text,
  p_old jsonb,
  p_new jsonb
)
returns text
language plpgsql
immutable
as $$
declare
  v_label text;
  v_row jsonb := coalesce(p_new, p_old);
begin
  if p_table = 'volunteers' then
    v_label := trim(both ' ' from coalesce(v_row->>'last_name', '') || ' ' || coalesce(v_row->>'first_name', ''));
  elsif p_table = 'dogs' then
    v_label := coalesce(v_row->>'name', v_row->>'id');
  elsif p_table = 'course_catalog' then
    v_label := coalesce(v_row->>'code', v_row->>'name', v_row->>'id');
  elsif p_table = 'profiles' then
    v_label := coalesce(v_row->>'role', '') || ' ' || coalesce(v_row->>'id', '');
  else
    v_label := coalesce(v_row->>'id', '');
  end if;

  return upper(p_action) || ' ' || p_table || case
    when v_label is not null and v_label <> '' then ': ' || v_label
    else ''
  end;
end;
$$;

create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_email text := public.audit_actor_email(v_actor);
  v_old jsonb;
  v_new jsonb;
  v_record_id text;
begin
  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    v_new := null;
    v_record_id := public.audit_record_id(v_old);
    insert into public.audit_log (
      actor_id, actor_email, action, table_name, record_id, summary, old_data, new_data
    ) values (
      v_actor,
      v_email,
      'DELETE',
      tg_table_name,
      v_record_id,
      public.audit_row_summary('DELETE', tg_table_name, v_old, v_new),
      v_old,
      v_new
    );
    return old;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    if v_old = v_new then
      return new;
    end if;
    v_record_id := public.audit_record_id(v_new);
    insert into public.audit_log (
      actor_id, actor_email, action, table_name, record_id, summary, old_data, new_data
    ) values (
      v_actor,
      v_email,
      'UPDATE',
      tg_table_name,
      v_record_id,
      public.audit_row_summary('UPDATE', tg_table_name, v_old, v_new),
      v_old,
      v_new
    );
    return new;
  else
    v_old := null;
    v_new := to_jsonb(new);
    v_record_id := public.audit_record_id(v_new);
    insert into public.audit_log (
      actor_id, actor_email, action, table_name, record_id, summary, old_data, new_data
    ) values (
      v_actor,
      v_email,
      'INSERT',
      tg_table_name,
      v_record_id,
      public.audit_row_summary('INSERT', tg_table_name, v_old, v_new),
      v_old,
      v_new
    );
    return new;
  end if;
end;
$$;

-- Attacca il trigger alle tabelle anagrafiche operative
do $$
declare
  t text;
begin
  foreach t in array array[
    'volunteers',
    'dogs',
    'medical_checks',
    'volunteer_courses',
    'course_catalog',
    'equipment_issues',
    'profiles'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists trg_audit_%I on public.%I', t, t);
      execute format(
        'create trigger trg_audit_%I
           after insert or update or delete on public.%I
           for each row execute function public.audit_trigger_fn()',
        t, t
      );
    end if;
  end loop;
end $$;

-- Eventi applicativi (LOGIN / LOGOUT / altro) dal frontend
create or replace function public.log_app_event(
  p_action text,
  p_summary text default null,
  p_table_name text default null,
  p_record_id text default null,
  p_new_data jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_id uuid;
  v_action text := upper(btrim(coalesce(p_action, '')));
begin
  if v_actor is null then
    raise exception 'Utente non autenticato';
  end if;

  if v_action not in ('LOGIN', 'LOGOUT', 'EXPORT', 'VIEW', 'OTHER') then
    raise exception 'Azione non consentita: %', v_action;
  end if;

  insert into public.audit_log (
    actor_id, actor_email, action, table_name, record_id, summary, old_data, new_data
  ) values (
    v_actor,
    public.audit_actor_email(v_actor),
    v_action,
    p_table_name,
    p_record_id,
    coalesce(nullif(btrim(p_summary), ''), v_action),
    null,
    p_new_data
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.log_app_event(text, text, text, text, jsonb) from public;
grant execute on function public.log_app_event(text, text, text, text, jsonb) to authenticated;
