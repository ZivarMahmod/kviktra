# Instruktion: Migrera LVC Media Hub (Kvittra) till ren Supabase

## Kontext

Du jobbar med ett volleyboll-videoanalys-projekt kallat **LVC Media Hub / Kvittra**.
Det är byggt med Express + Prisma men **ALLT ska köras direkt i Supabase** — ingen Express, ingen Prisma, ingen custom auth.

- **Repo:** https://github.com/ZivarMahmod/LVC-test-yta-
- **Branch:** `claude/explore-migrate-supabase-gGM4t`
- **Supabase är KÄRNAN** — inget annat.

## Viktiga regler

1. **TA INTE BORT NÅGOT FÖRRÄN DET ÄR MIGRERAT OCH FUNGERAR I SUPABASE**
2. Varje steg ska verifieras innan nästa påbörjas
3. Migrera in först → verifiera att det funkar → ta bort gammalt sist
4. Inget raderas förrän det nya bevisligen fungerar

## Starta med att förstå projektet

Innan du gör något:
- Läs `KVITTRA-SPEC.md` — den har hela produktspecen (13 steg, rollsystem, auth-flöde)
- Läs `supabase/migrations/001_complete_schema.sql` — det kompletta Supabase-schemat
- Läs `backend/prisma/schema.prisma` — nuvarande databasmodell (det som ska ersättas)
- Läs `backend/src/services/dvwParser.js` — DVW-parsern (ska flyttas till Edge Function)
- Läs `backend/src/services/statsEngine.js` — statistikmotorn (ska behållas)
- Läs `DEPLOY.md` om den finns
- Kolla igenom `frontend/src/` för att förstå komponentstrukturen
- Kolla `frontend/src/utils/api.js` — alla API-anrop som ska skrivas om
- Kolla auth-flödet: AuthContext, login-sida, Express auth-routes

Rapportera vad du hittat innan du börjar ändra något.

---

## STEG 1: Migrera databasen IN i Supabase

**Vad:** Kör det färdiga SQL-schemat mot Supabase PostgreSQL.

- Kör `supabase/migrations/001_complete_schema.sql` mot databasen
- Verifiera att ALLA tabeller skapats korrekt
- Verifiera att RLS-policies är aktiva på alla tabeller
- Verifiera att Storage buckets skapats: `videos`, `dvw-files`, `thumbnails`, `documents`, `avatars`
- **TA INTE BORT Prisma-tabellerna ännu** — de ska finnas kvar som referens

**Klart när:** Alla tabeller finns, RLS är aktivt, buckets existerar.

---

## STEG 2: Migrera auth IN i Supabase Auth

**Vad:** Byt från custom Express-auth till Supabase Auth.

1. Installera `@supabase/supabase-js` i frontend (om inte redan installerat)
2. Skapa `frontend/src/lib/supabase.js` med Supabase-klient:
   ```js
   import { createClient } from '@supabase/supabase-js'
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   )
   ```
3. Bygg **NY** AuthContext som använder `supabase.auth.onAuthStateChange()`
4. Bygg **NY** login-sida som använder `supabase.auth.signInWithPassword()`
5. Testa att inloggning fungerar via Supabase Auth
6. **FÖRST NÄR DET FUNGERAR:** ta bort gamla AuthContext och Express auth-routes

**Klart när:** Användare kan logga in/ut via Supabase Auth, sessioner persisterar.

---

## STEG 3: Migrera API-anrop IN i Supabase

**Vad:** Skriv om alla `fetch('/api/...')` till `supabase.from('tabell').select()` etc.

1. Skriv om `frontend/src/utils/api.js` att använda supabase-klienten
2. Alla CRUD-operationer ska gå direkt mot Supabase:
   - `supabase.from('teams').select()` istället för `fetch('/api/admin/teams')`
   - `supabase.from('seasons').insert()` istället för `fetch('/api/admin/seasons', { method: 'POST' })`
   - Samma mönster för matcher, spelare, actions, etc.
3. Testa VARJE anrop: skapa lag, skapa säsong, lista matcher, etc.
4. **FÖRST NÄR ALLT FUNGERAR:** ta bort Express controllers och routes

**Klart när:** Alla datahämtningar och skrivningar går via Supabase-klienten, inga Express-anrop kvar.

---

## STEG 4: Migrera fillagring IN i Supabase Storage

**Vad:** Byt från Express fileStorage.js till Supabase Storage buckets.

1. Video-uppladdning → `supabase.storage.from('videos').upload()`
2. DVW-filer → `supabase.storage.from('dvw-files').upload()`
3. Thumbnails → `supabase.storage.from('thumbnails').upload()`
4. Dokument → `supabase.storage.from('documents').upload()`
5. Avatarer → `supabase.storage.from('avatars').upload()`
6. Testa att uppladdning OCH nedladdning fungerar för varje bucket
7. **FÖRST NÄR DET FUNGERAR:** ta bort Express `fileStorage.js`

**Klart när:** Alla filer laddas upp/ner via Supabase Storage.

---

## STEG 5: Migrera DVW-parsing till Supabase Edge Function

**Vad:** Flytta DVW-parsern från Express-endpoint till en Supabase Edge Function.

1. Ta koden från `backend/src/services/dvwParser.js`
2. Skapa en Supabase Edge Function: `supabase/functions/parse-dvw/index.ts`
3. Flödet: Frontend laddar upp `.dvw` → anropar Edge Function → den parsar och gör `INSERT INTO actions`
4. Testa med `test-data/sample-match.dvw` (om den finns)
5. **FÖRST NÄR DET FUNGERAR:** ta bort Express DVW-endpoints

**Klart när:** DVW-filer kan laddas upp och parsas via Edge Function, data hamnar i `actions`-tabellen.

---

## STEG 6: Rensa gamla Express/Prisma (SIST — allra sist)

**Vad:** Nu när allt kör i Supabase, rensa bort det gamla.

- Ta bort `backend/src/controllers/`
- Ta bort `backend/src/middleware/`
- Ta bort `backend/src/routes/`
- Ta bort `backend/prisma/`
- Ta bort gamla Prisma-tabeller från databasen
- Ta bort `backend/src/services/fileStorage.js`
- Flytta `backend/src/services/statsEngine.js` till frontend eller Edge Function (ta INTE bort)
- Flytta `backend/src/services/dvwParser.js`-logiken är redan i Edge Function (ta bort originalet)

**Klart när:** Ingen Express/Prisma-kod kvar. Allt körs via Supabase.

---

## VAD SOM SKA BEHÅLLAS (rör inte dessa)

- Alla frontend-komponenter (`pages/`, `components/`) — byt bara datakälla
- DVW-parser-logiken (flyttas till Edge Function, raderas inte)
- Statistikmotorn `statsEngine.js` (flyttas till frontend eller Edge Function)
- Docker-compose med Supabase-stack
- Cloudflare Tunnel-setup
- `KVITTRA-SPEC.md`
- `DEPLOY.md`
- `test-data/`

## Mönster att följa

Supabase-klienten ska användas direkt från frontend. Exempel:

```js
// Hämta alla lag
const { data: teams, error } = await supabase
  .from('teams')
  .select('*')
  .order('name')

// Skapa match
const { data, error } = await supabase
  .from('matches')
  .insert({ home_team_id, away_team_id, season_id, date })
  .select()
  .single()

// Ladda upp video
const { data, error } = await supabase.storage
  .from('videos')
  .upload(`${matchId}/${file.name}`, file)

// Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})
```

RLS-policies i databasen ser till att användare bara ser sin egen data — ingen backend-logik behövs för det.

## Sammanfattning

```
FÖRE: Frontend → Express API → Prisma → PostgreSQL
EFTER: Frontend → Supabase Client → PostgreSQL (med RLS)
                → Supabase Auth
                → Supabase Storage
                → Supabase Edge Functions (DVW-parsing)
```

Kör ett steg i taget. Verifiera. Gå vidare. Radera gammalt sist.
