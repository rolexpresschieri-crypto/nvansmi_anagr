-- N° tessera ENCI sul volontario (opzionale)
alter table public.volunteers
  add column if not exists enci_card_number text;
