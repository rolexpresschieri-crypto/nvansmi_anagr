-- Sostituisce PC con ODR in qualification_enum
-- Un solo comando: rinomina il valore enum (aggiorna anche i record esistenti).

alter type public.qualification_enum rename value 'PC' to 'ODR';

-- Verifica:
-- select qualification::text, count(*) from public.volunteers group by 1 order by 1;

-- ---------------------------------------------------------------------------
-- Se compare errore "ODR already exists" (hai già aggiunto ODR in un tentativo
-- precedente), esegui SOLO questo in una query separata:
--
-- update public.volunteers
-- set qualification = 'ODR'::qualification_enum
-- where qualification::text = 'PC';
-- ---------------------------------------------------------------------------
