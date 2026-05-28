# NV ANSMI Anagrafica

Frontend Next.js collegato a Supabase per gestire:

- login email/password
- elenco volontari
- dettaglio volontario con sezione cani

## Configurazione

1. Copia `.env.example` in `.env.local`
2. Inserisci:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Avvio locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Prerequisiti Supabase

- Schema SQL già applicato
- Utente creato in `Authentication > Users`
- Record utente presente in `public.profiles` con ruolo (es. `admin`)
