-- Estensione schema dogs con campi K9 aggiornati
alter table public.dogs add column if not exists enci_propedeutic_exam_date date;
alter table public.dogs add column if not exists enci_sup_exam_date date;
alter table public.dogs add column if not exists enci_mac_exam_date date;

alter table public.dogs add column if not exists enci_trainer_protocol text;
alter table public.dogs add column if not exists enci_trainer_license_date date;
alter table public.dogs add column if not exists enci_s2_completed boolean;
alter table public.dogs add column if not exists enci_s2_date date;

alter table public.dogs add column if not exists anpas_sup_exam_number text;
alter table public.dogs add column if not exists anpas_sup_exam_date date;
alter table public.dogs add column if not exists anpas_sup_last_renewal_date date;
alter table public.dogs add column if not exists anpas_mac_exam_number text;
alter table public.dogs add column if not exists anpas_mac_exam_date date;
alter table public.dogs add column if not exists anpas_trainer boolean;
alter table public.dogs add column if not exists anpas_trainer_protocol text;
alter table public.dogs add column if not exists anpas_trainer_license_date date;

alter table public.dogs add column if not exists k9_form_timestamp timestamptz;
