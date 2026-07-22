# Yagiu OS — Go Live Checklist

**Modalità:** Go Live (post v1.0)  
**Data audit:** 15 luglio 2026  
**Versione app:** `0.1.0`  
**Ambito:** audit operativo — nessuna modifica al codice  
**Riferimenti:** `RELEASE_READINESS.md` (RC1), `PROJECT_STATUS.md`, `.env.local.example`

---

## Executive summary

Yagiu OS è **software completato** (roadmap v1.0 chiusa) ma **non ancora plug-and-play** in produzione. Il go-live richiede provisioning manuale di Supabase, variabili su Vercel, creazione utenti e runbook operativo.

| Scenario | Pronto? |
|----------|---------|
| Pilot interno single-tenant (team Yagiu, aspettative allineate) | ✅ Con setup ops |
| Go-live senza migration/env/utenti | ❌ |
| Invio email/WhatsApp reali al cliente | ❌ (solo tracciamento DB) |
| Automazioni eseguite automaticamente | ❌ (solo CRUD configurazione) |

**Confidenza go-live operativo:** 76% (vedi `RELEASE_READINESS.md`)

---

## Legenda stati

| Stato | Significato |
|-------|-------------|
| 🟢 Pronto | Configurato o verificabile; non richiede sviluppo |
| 🟡 Parziale | Funziona con limiti noti; configurazione o aspettative da allineare |
| 🔴 Da fare | Blocco operativo se non completato |
| ⚪ N/A | Non implementato nel codice v1.0 |

| Blocca go-live | Significato |
|----------------|-------------|
| **Sì** | L'app non è utilizzabile senza questo passaggio |
| **Condizionale** | Blocca solo se la funzionalità è in scope go-live |
| **No** | Non impedisce l'uso del gestionale core |

---

## Checklist rapida pre-go-live

### Bloccanti assoluti (must-have)

- [ ] Progetto Supabase produzione creato (separato da dev)
- [ ] 8 migration applicate (`npm run supabase:apply-migrations`)
- [ ] `npm run supabase:verify` verde contro env produzione
- [ ] Env Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID`
- [ ] Almeno un utente admin creato in Supabase Auth
- [ ] Redirect URL auth configurati in Supabase (login + reset password)
- [ ] Smoke manuale post-deploy (login → cliente → tour → pagamento)

### Condizionali (se in scope)

- [ ] `OPENAI_API_KEY` su Vercel (solo se `/ai` in scope)
- [ ] SMTP custom Supabase (solo se reset password via email richiesto in produzione)
- [ ] Comunicazione al team: email/WhatsApp = solo registro DB, non invio reale

---

## 1. Variabili ambiente

### Stato

🟡 **Parziale** — template presente in `.env.local.example`; produzione dipende da Vercel (o host equivalente). `.env.local` non è versionato (corretto).

### Come configurarlo

| Variabile | Runtime | Obbligatoria prod | Note |
|-----------|---------|-------------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Middleware | **Sì** | Dashboard Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Middleware | **Sì** | Chiave `anon` / `public` |
| `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID` | Client | **Sì** | Deve coincidere con seed org (`00000000-0000-4000-8000-000000000001`) |
| `OPENAI_API_KEY` | Server (`/ai`) | Condizionale | Solo server-side Vercel, mai `NEXT_PUBLIC_*` |
| `SUPABASE_SERVICE_ROLE_KEY` | Script locali/CI | No runtime app | Bootstrap utenti, Admin API |
| `SUPABASE_DB_URL` | Script migration | No runtime app | Connection string Postgres diretta |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Smoke test | No prod | Solo verifica locale/CI |

**Vercel:** Project → Settings → Environment Variables → impostare per **Production** (e opzionalmente Preview).

**Locale (ops):** copiare `.env.local.example` → `.env.local` con valori del progetto produzione per eseguire script di verifica.

### Blocca go-live?

| Variabile | Blocca? |
|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_*` + `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID` | **Sì** |
| `OPENAI_API_KEY` | **Condizionale** (solo `/ai`) |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_DB_URL` | **No** (runtime app) |

### Procedura esatta

1. Aprire [Supabase Dashboard](https://supabase.com/dashboard) → progetto produzione → **Settings → API**.
2. Copiare **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`.
3. Copiare **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Impostare `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID=00000000-0000-4000-8000-000000000001` (se non si modificano le migration).
5. In Vercel: aggiungere le tre variabili `NEXT_PUBLIC_*` all'ambiente **Production**.
6. Se AI in scope: aggiungere `OPENAI_API_KEY` (senza prefisso `NEXT_PUBLIC_`).
7. Per script ops locali: aggiungere in `.env.local` anche `SUPABASE_DB_URL` e `SUPABASE_SERVICE_ROLE_KEY` (non committare).
8. Rideployare l'app dopo ogni modifica env su Vercel.

**Verifica:**

```bash
# Con .env.local puntato a produzione
npm run supabase:verify
```

---

## 2. Supabase produzione

### Stato

🔴 **Da fare** (assumendo progetto produzione non ancora provisionato) — codice e migration pronti; 8 file SQL in `supabase/migrations/`, script `supabase:apply-migrations` e `supabase:verify` operativi. RC1: verify verde su ambiente auditato (41 tabelle).

### Come configurarlo

- **Progetto dedicato** produzione, separato da dev/staging.
- **Regione:** allineata al team (es. `eu-central-1`).
- **Migration:** applicare in ordine alfabetico/cronologico tutti i file in `supabase/migrations/`:

| # | File migration |
|---|----------------|
| 1 | `20260715090000_sprint_0_legacy_schema.sql` |
| 2 | `20260715100000_sprint_1a_tour_core.sql` |
| 3 | `20260715120000_sprint_1a_tour_extended.sql` |
| 4 | `20260715140000_sprint_1b_tour_program.sql` |
| 5 | `20260715200000_sprint_2_preventivi.sql` |
| 6 | `20260715300000_sprint_3_auth_multi_tenant.sql` |
| 7 | `20260715400000_sprint_5_roles_permissions.sql` |
| 8 | `20260715500000_sprint_5_3_legacy_rls.sql` |

- **Seed automatico:** org `Yagiu OS Default` (`00000000-...0001`) e workspace `main` (`00000000-...0002`) creati dalla migration Sprint 3.
- **PostgREST:** dopo migration, lo schema è esposto automaticamente; in caso di `PGRST205` attendere o eseguire `NOTIFY pgrst, 'reload schema'`.

### Blocca go-live?

**Sì** — senza DB migrato l'app fallisce in produzione con `MissingSupabaseTableError` (fail loud, non mock).

### Procedura esatta

1. Creare progetto Supabase produzione.
2. Dashboard → **Settings → Database** → copiare **Connection string (URI)** → `SUPABASE_DB_URL` in `.env.local` (sessione ops, non Vercel).
3. Eseguire:

```bash
npm run supabase:apply-migrations
```

4. Verificare seed in SQL Editor:

```sql
SELECT id, name, slug FROM public.organizations;
SELECT id, name, slug FROM public.workspaces;
```

Attesi: org `00000000-0000-4000-8000-000000000001`, workspace `00000000-0000-4000-8000-000000000002`.

5. Eseguire verifica completa:

```bash
npm run supabase:verify
```

6. Output atteso: 41 tabelle ✅ + autenticazione test user ✅ (se utente test creato).

**Alternativa manuale:** incollare ogni file `.sql` nella Supabase SQL Editor nell'ordine sopra.

---

## 3. Autenticazione

### Stato

🟢 **Pronto** (codice) — middleware attivo, sessione SSR Supabase, pagine `/login`, `/recupera-password`, `/aggiorna-password`. **Configurazione Supabase Dashboard richiesta** per redirect URL e (opzionale) SMTP.

### Come configurarlo

**Codice (già presente):**

- `middleware.ts` → `updateSession()` su tutte le route tranne asset statici.
- Non autenticato → redirect `/login?next=<path>`.
- Autenticato su route auth → redirect `/`.
- Reset password: `redirectTo = {origin}/aggiorna-password` (`src/auth/auth.service.ts`).

**Supabase Dashboard → Authentication → URL Configuration:**

| Impostazione | Valore esempio |
|--------------|----------------|
| Site URL | `https://app.yagiutravel.com` (dominio produzione) |
| Redirect URLs | `https://app.yagiutravel.com/**`, `https://*.vercel.app/**` (preview) |

**Provider:** Email/Password (default Supabase). Nessuna UI di registrazione nell'app.

**⚠️ Rischio configurazione:** se `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` mancano, il middleware **non protegge** le route (pass-through). Vedi sezione Sicurezza.

### Blocca go-live?

**Sì** (configurazione) — senza env Supabase e redirect URL il login e il reset password non funzionano in produzione.

### Procedura esatta

1. Supabase → **Authentication → Providers** → abilitare **Email**.
2. **URL Configuration** → impostare Site URL e Redirect URLs (incluso `/aggiorna-password`).
3. Vercel → verificare env `NEXT_PUBLIC_SUPABASE_*`.
4. Deploy app.
5. Aprire `https://<dominio>/login` → tentare login con utente creato (sezione Utenti).
6. Test reset password: `/recupera-password` → verificare email (richiede SMTP Supabase o provider custom — vedi Email).
7. Dopo click link email → deve aprire `/aggiorna-password` e consentire nuova password.

---

## 4. Utenti

### Stato

🟡 **Parziale** — nessuna UI di signup/registrazione. Bootstrap automatico al primo insert in `auth.users` via trigger `handle_new_auth_user()` (profile + membership `workspace_admin` su org/ws seed).

### Come configurarlo

**Trigger automatico** (migration Sprint 3): ogni nuovo utente Auth riceve:

- `user_profiles` con org `00000000-...0001`, workspace `00000000-...0002`
- `memberships` con ruolo `workspace_admin`, scope `workspace`, status `active`

**Metodi creazione utenti:**

| Metodo | Quando usarlo |
|--------|---------------|
| Supabase Dashboard → Authentication → Users → Add user | Primo admin, pochi utenti |
| Admin API (`SUPABASE_SERVICE_ROLE_KEY`) | Automazione / script |
| `npm run bootstrap:sprint3` | Crea utente smoke test + verifica Sprint 3 |

### Blocca go-live?

**Sì** — senza almeno un utente Auth confermato nessuno può accedere al gestionale.

### Procedura esatta — primo admin (Dashboard)

1. Supabase → **Authentication → Users** → **Add user**.
2. Inserire email e password del primo operatore.
3. Spuntare **Auto Confirm User** (evita conferma email obbligatoria).
4. Salvare.
5. Verificare in SQL Editor:

```sql
SELECT u.email, p.display_name, m.role_key, m.status
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
LEFT JOIN public.memberships m ON m.user_id = u.id;
```

6. Login su `/login` con le credenziali create.

**Procedura esatta — utente aggiuntivo (Admin API)**

```bash
# Con SUPABASE_SERVICE_ROLE_KEY in .env.local
node --env-file=.env.local -e "
import { createClient } from '@supabase/supabase-js';
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const { data, error } = await admin.auth.admin.createUser({
  email: 'nome@azienda.it',
  password: '<password-sicura>',
  email_confirm: true,
  user_metadata: { display_name: 'Nome Cognome' }
});
console.log(error || data.user?.email);
"
```

**Nota ruoli:** tutti i nuovi utenti ricevono `workspace_admin` dal trigger. Per ruoli granulari (Sprint 5.2) aggiornare manualmente `memberships.role_key` o usare tabelle `roles` / `permissions` — la UI non nasconde azioni per permesso (RLS DB è il gate principale).

---

## 5. Storage

### Stato

🟡 **Parziale** — upload documenti tour implementato (`src/services/tour-documento.service.ts`); bucket definito in migration Sprint 1A. Policy **permissive** (anon + authenticated, senza vincolo org).

### Come configurarlo

- Bucket creato dalla migration: `tour-documents`
- Path file: `{organizationId}/{tourId}/{timestamp}_{filename}`
- Limite dimensione: 50 MB (`52428800` bytes)
- URL pubblici via `getPublicUrl()` (bucket `public: true`)

Nessuna configurazione aggiuntiva in Supabase Dashboard se le migration sono applicate.

### Blocca go-live?

**Condizionale** — blocca solo se il team usa documenti tour in go-live. Il core CRM/tour funziona senza upload.

### Procedura esatta

1. Dopo migration, verificare in Supabase → **Storage** → bucket `tour-documents` presente.
2. Login app → aprire scheda tour → tab Documenti → caricare un file di test.
3. Verificare record in `tour_documents` e file in Storage sotto path `00000000-...0001/<tourId>/...`.
4. Aprire URL pubblico dal record → file scaricabile.

**Se upload fallisce:** controllare policy `storage.objects` e che l'utente sia autenticato.

---

## 6. Bucket

### Stato

🟡 **Parziale** — bucket `tour-documents` con `public: true` e policy aperte a `anon, authenticated` senza filtro `organization_id`.

### Come configurarlo

Definito in `supabase/migrations/20260715120000_sprint_1a_tour_extended.sql`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('tour-documents', 'tour-documents', true, 52428800);
```

Policy: SELECT/INSERT/UPDATE/DELETE per `anon` e `authenticated` su `bucket_id = 'tour-documents'`.

**Non modificare manualmente** senza runbook — hardening policy è post go-live (roadmap 2.0 / ops).

### Blocca go-live?

**No** per pilot interno. **Condizionale** per esposizione pubblica internet — rischio accesso file se URL/path noti (vedi Sicurezza).

### Procedura esatta

1. Supabase → **Storage** → verificare bucket `tour-documents`, Public = ON.
2. SQL Editor:

```sql
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'tour-documents';
```

3. Accettare il rischio per pilot interno **oppure** documentare che gli URL documenti non vanno condivisi esternamente fino a hardening policy.

---

## 7. Email

### Stato

🟡 **Parziale** — due canali distinti:

| Canale | Stato | Implementazione |
|--------|-------|-----------------|
| **Email operative app** (invio a clienti) | Simulazione DB | `inviaEmailSimulata()` → tabella `email_invii` + timeline cliente. **Nessun provider** (SendGrid, Resend, SMTP). |
| **Email Auth** (reset password) | Dipende da Supabase | `resetPasswordForEmail()` — usa infrastruttura email Supabase (limitata) o SMTP custom in Dashboard. |

### Come configurarlo

**Invii app (comunicazioni):** nessuna env richiesta — funziona subito come registro interno.

**Reset password (Auth):**

Supabase → **Authentication → Email Templates** (personalizzazione opzionale)  
Supabase → **Project Settings → Auth → SMTP Settings** → configurare provider SMTP custom per produzione (consigliato).

### Blocca go-live?

| Aspetto | Blocca? |
|---------|---------|
| Registro invii email in app | **No** |
| Invio email reale al cliente | **Sì** se promesso al business — non implementato |
| Reset password via email | **Condizionale** — senza SMTP/config Supabase il link potrebbe non arrivare |

### Procedura esatta

**Verifica invio simulato (scope attuale v1.0):**

1. Login → scheda cliente → **Invia email**.
2. Compilare destinatario, oggetto, messaggio → invia.
3. Verificare in Supabase Table Editor → `email_invii` nuovo record.
4. Verificare timeline cliente aggiornata.

**Configurazione SMTP Auth (se reset password richiesto):**

1. Supabase → Settings → Auth → **Enable Custom SMTP**.
2. Inserire host, porta, user, password del provider (es. Resend, SendGrid, Google Workspace).
3. Test: `/recupera-password` con email utente reale → ricevere link → `/aggiorna-password`.

**Comunicazione team:** gli invii da Yagiu OS **non escono** verso il cliente fino a integrazione provider (fuori scope v1.0).

---

## 8. WhatsApp

### Stato

🟡 **Parziale** — UI conversazioni e invii completi; persistenza su `whatsapp_invii`, `whatsapp_conversazioni`, `whatsapp_templates`. **Nessuna integrazione** Meta Cloud API / Twilio.

### Come configurarlo

Nessuna variabile ambiente. Funzione: `inviaWhatsAppSimulato()` in `src/services/whatsapp.service.ts`.

### Blocca go-live?

**No** per uso gestionale interno (tracciamento invii e conversazioni).  
**Sì** se il business si aspetta messaggi WhatsApp reali al cliente.

### Procedura esatta

1. Login → `/whatsapp` → verificare lista conversazioni (da DB).
2. Scheda cliente → **Invia WhatsApp** → compilare numero e messaggio.
3. Verificare `whatsapp_invii` e aggiornamento conversazione.
4. Comunicare al team: messaggi **non** recapitati su WhatsApp reale.

**Post go-live (fuori v1.0):** integrare provider + webhook + env dedicate (`WHATSAPP_*`) — non presenti nel codice attuale.

---

## 9. OpenAI

### Stato

🟡 **Parziale** — AI Assistant su `/ai` via server action `completeAiPrompt()` (`src/ai/services/ai-complete.server.ts`). Provider OpenAI Chat Completions. Senza chiave → errore runtime esplicito.

### Come configurarlo

| Variabile | Dove | Note |
|-----------|------|------|
| `OPENAI_API_KEY` | Vercel → Environment Variables → **Production** | Solo server-side, mai `NEXT_PUBLIC_` |

Modello e parametri: `src/ai/providers/llm.provider.ts`.

### Blocca go-live?

**Condizionale** — blocca solo se `/ai` è in scope go-live. Il gestionale core (tour, clienti, preventivi, pagamenti) funziona senza OpenAI.

### Procedura esatta

1. Ottenere API key da [OpenAI Platform](https://platform.openai.com/api-keys).
2. Vercel → aggiungere `OPENAI_API_KEY=sk-...` (Production).
3. Rideploy.
4. Login → `/ai` → inviare prompt di test → risposta LLM attesa.
5. Monitorare usage/billing su dashboard OpenAI.

**Se AI non in scope:** non impostare la variabile; informare il team che `/ai` non è disponibile.

---

## 10. Automazioni

### Stato

⚪ **Solo configurazione** — CRUD su tabella `automazioni` (`/automazioni`). **Nessun motore di esecuzione** nel codebase: nessun worker, edge function o job che legga trigger e agisca. Campo `ultima_esecuzione` non aggiornato da runner automatico.

### Come configurarlo

Nessuna env. Dati in `public.automazioni` (trigger, stato, configurazione JSON). Stessa situazione per `/programmazione` (`schedulazioni`) — CRUD senza scheduler che esegua gli appuntamenti.

### Blocca go-live?

**No** — le automazioni sono una feature di **configurazione e visibilità**, non di esecuzione automatica. Non bloccano il go-live del gestionale operativo.

### Procedura esatta

1. Login → `/automazioni` → creare/modificare un'automazione di test.
2. Verificare persistenza in tabella `automazioni`.
3. **Non** aspettarsi esecuzione automatica o notifiche scatenate dal trigger.
4. Comunicare al team: automazioni v1.0 = catalogo/registro; esecuzione reale è roadmap futura (cron/worker).

---

## 11. Cron

### Stato

⚪ **N/A** — nessun `vercel.json` con `crons`, nessuna Supabase Edge Function schedulata, nessun GitHub Action periodico nel repo.

### Come configurarlo

Non applicabile in v1.0. Per job futuri (automazioni, reminder, digest email) servirà infrastruttura esterna (Vercel Cron, Supabase pg_cron, worker dedicato).

### Blocca go-live?

**No**.

### Procedura esatta

1. Documentare assenza cron come limitazione nota.
2. Processi manuali o promemoria calendario esterni per operazioni ricorrenti fino a implementazione runner.
3. Non cercare configurazione cron nel deploy attuale — non esiste.

---

## 12. Sicurezza

### Stato

🟡 **Parziale** — RLS org-scoped attivo (Sprint 3 + 5.3), middleware auth, nessuna API route server. Rischi noti da mitigare operativamente.

### Come configurarlo

| Area | Stato attuale | Azione ops |
|------|---------------|------------|
| RLS database | ✅ Org-scoped su tabelle core | Verificare con smoke auth |
| Middleware | ✅ Redirect login | **Verificare env sempre presenti su Vercel** |
| Storage pubblico | ⚠️ Bucket `tour-documents` public + policy larghe | Accettare rischio pilot o limitare condivisione URL |
| Permessi UI | ⚠️ `hasPermission` non cablato sulle viste | Tutti gli utenti autenticati vedono tutte le azioni; RLS è il gate |
| Service role key | Solo script | **Mai** esporre in client o `NEXT_PUBLIC_*` |
| Signup pubblico | Disabilitato (no UI) | Creare utenti solo via admin |
| HTTPS | Vercel default | Usare dominio con TLS |

**Supabase Dashboard:**

- **Authentication → Attack Protection** (rate limit, CAPTCHA opzionale).
- **Database → Network** (restrict IP se necessario).
- Ruotare chiavi se compromesse.

### Blocca go-live?

**Condizionale:**

- Env Supabase mancanti su Vercel → **Sì** (middleware bypass).
- Storage pubblico → **No** per pilot interno chiuso; **Sì** per dati sensibili esposti su internet senza hardening.

### Procedura esatta

1. Verificare su Vercel che **tutte** le env `NEXT_PUBLIC_SUPABASE_*` siano impostate (test: visitare app senza login → deve redirect a `/login`, non dashboard aperta).
2. Eseguire `npm run test:auth-flow` contro produzione (con `.env.local` produzione) — conferma RLS blocca insert anon su `clienti`.
3. Eseguire `npm run test:auth-permissions-flow` — catalogo ruoli/permessi OK.
4. Documentare policy storage e non pubblicare URL documenti tour esternamente.
5. Limitare accesso al gestionale al team autorizzato (nessun self-signup).
6. Abilitare **2FA** sugli account Supabase Dashboard e Vercel degli amministratori.

---

## 13. Backup

### Stato

🔴 **Da configurare** (lato Supabase) — nessun meccanismo backup nel codice applicativo.

### Come configurarlo

**Supabase (primario):**

- Piano Free: backup limitati; verificare [documentazione backup Supabase](https://supabase.com/docs/guides/platform/backups).
- Piano Pro+: backup giornalieri automatici + Point-in-Time Recovery (PITR) opzionale.

**Dati da proteggere:**

- Database Postgres (41 tabelle applicative + auth).
- Storage bucket `tour-documents`.
- Configurazione progetto (migration versionate in git — già backup nel repo).

### Blocca go-live?

**Condizionale** — non blocca il primo accesso, ma **Sì** per go-live operativo responsabile con dati clienti reali.

### Procedura esatta

1. Supabase → **Settings → Database** → verificare piano e policy backup.
2. Se Pro: abilitare PITR se disponibile per la regione.
3. Documentare RPO/RTO attesi (es. backup giornaliero, restore < 1h).
4. **Test restore** su progetto staging (clone o nuovo progetto) almeno una volta prima di dati produzione critici.
5. Export manuale periodico (opzionale): `pg_dump` via `SUPABASE_DB_URL` per snapshot aggiuntivo.
6. Storage: considerare replica o export periodico file critici se volume cresce.

```bash
# Snapshot manuale schema+dati (ops, con SUPABASE_DB_URL)
pg_dump "$SUPABASE_DB_URL" -Fc -f "yagiu-os-backup-$(date +%Y%m%d).dump"
```

---

## 14. Logging

### Stato

🟡 **Parziale** — logging applicativo minimo; audit business su DB.

| Tipo | Dove | Contenuto |
|------|------|-----------|
| Audit business | Tabella `audit_log` + UI `/registro` | Mutazioni core (tour, preventivi, pagamenti, ecc.) via `recordAuditLog()` |
| Auth audit | Tabella `auth_audit_events` | Eventi login/logout (best-effort, errori → `console.error`) |
| Errori UI | `src/app/(dashboard)/error.tsx` | `console.error` lato client |
| Log server Vercel | Runtime Next.js | Log build/deploy e server actions (`/ai`) |
| Log Supabase | Dashboard → Logs | Postgres, Auth, Storage, API |

Nessun aggregatore centralizzato (Sentry, Datadog, Logtail) nel repo.

### Come configurarlo

- **Vercel:** Dashboard → Project → **Logs** (runtime).
- **Supabase:** Dashboard → **Logs** (filtrare per Auth, Postgres, Storage).
- Nessuna env aggiuntiva richiesta per logging base.

### Blocca go-live?

**No** — sufficiente per pilot. **Condizionale** per SLA produzione con alerting proattivo.

### Procedura esatta

1. Post-deploy: eseguire un'azione (es. modifica cliente) → verificare voce in `/registro` e riga in `audit_log`.
2. Login/logout → controllare `auth_audit_events` in Supabase Table Editor.
3. Provocare errore su `/ai` senza chiave (se test) → verificare log in Vercel Functions/Logs.
4. Definire routine ops: controllo settimanale log Supabase Auth per tentativi anomali.
5. (Post go-live) Valutare Sentry o Vercel Log Drains per errori centralizzati.

---

## 15. Monitoraggio

### Stato

🔴 **Da configurare** — nessun Sentry, Datadog, uptime check o CI nel repo. Solo strumenti nativi Vercel + Supabase.

### Come configurarlo

**Minimo vitale (gratuito/nativo):**

| Strumento | Cosa monitora |
|-----------|---------------|
| Vercel Analytics / Speed Insights | Performance (opzionale, da abilitare in Vercel) |
| Vercel Deployment notifications | Deploy falliti |
| Supabase Dashboard | CPU, connessioni DB, errori API |
| Uptime esterno (es. UptimeRobot, Better Stack) | HTTP 200 su `/login` |

**Smoke test periodici:**

```bash
npm run test   # 6 smoke: auth, permissions, tour, preventivi, comunicazioni, questionario
```

Richiede `.env.local` con credenziali progetto target + utente test.

### Blocca go-live?

**No** per avvio pilot. **Sì** per produzione con SLA senza monitoraggio uptime/alerting.

### Procedura esatta

1. Configurare check HTTP ogni 5–15 min su URL produzione `/login` (atteso: 200 o 307 verso login).
2. Vercel → Notifications → email/Slack su deploy failure.
3. Supabase → Settings → impostare **billing alerts** e notifiche progetto.
4. Calendarizzare `npm run supabase:verify` + `npm run test` settimanale contro produzione (manuale o CI futura).
5. Definire owner on-call e runbook incidente (restore backup, rollback Vercel, disable progetto).

---

## Deploy Vercel — procedura consolidata

### Stato

🟡 **Parziale** — nessun `vercel.json`; build standard `next build` funzionante (RC1 verde).

### Procedura esatta

1. Collegare repository GitHub a Vercel.
2. Framework Preset: **Next.js** (auto-rilevato).
3. Build Command: `npm run build` (default).
4. Install Command: `npm install` (default).
5. Impostare env (sezione 1).
6. Deploy **Preview** → smoke manuale.
7. Assegnare dominio produzione.
8. Promuovere a **Production**.
9. Aggiornare Supabase Redirect URLs con dominio finale.

---

## Verifica post-go-live (smoke manuale)

Eseguire nell'ordine con utente reale su URL produzione:

| # | Azione | Esito atteso |
|---|--------|--------------|
| 1 | Aprire `/` senza sessione | Redirect `/login` |
| 2 | Login | Dashboard KPI visibile |
| 3 | Creare/modificare cliente | Record in `clienti` |
| 4 | Creare tour + partecipante | Record in `tours`, `tour_participants` |
| 5 | Registrare pagamento | Record in `tour_payments` |
| 6 | Creare preventivo e convertire | Flusso completo |
| 7 | Inviare email da scheda cliente | Record in `email_invii` (non email reale) |
| 8 | Inviare WhatsApp da scheda cliente | Record in `whatsapp_invii` |
| 9 | Upload documento tour | File in Storage + `tour_documents` |
| 10 | Aprire `/registro` | Eventi audit recenti |
| 11 | Notifiche TopBar | Caricamento da `notifiche` |
| 12 | `/ai` (se abilitato) | Risposta LLM |
| 13 | Logout | Redirect login, sessione terminata |

**Smoke automatici (ops, da macchina con `.env.local` produzione):**

```bash
npm run supabase:verify
npm run test
```

---

## Matrice riepilogativa

| Elemento | Stato | Blocca go-live | Priorità ops |
|----------|-------|----------------|--------------|
| Variabili ambiente | 🟡 | **Sì** (core) | P0 |
| Supabase produzione | 🔴 | **Sì** | P0 |
| Autenticazione | 🟢 + config | **Sì** | P0 |
| Utenti | 🟡 | **Sì** | P0 |
| Storage | 🟡 | Condizionale | P1 |
| Bucket | 🟡 | No (pilot) | P1 |
| Email (app) | 🟡 simulata | No / Condizionale | P1 |
| WhatsApp | 🟡 simulata | No / Condizionale | P1 |
| OpenAI | 🟡 | Condizionale | P2 |
| Automazioni | ⚪ CRUD only | No | P3 |
| Cron | ⚪ N/A | No | P3 |
| Sicurezza | 🟡 | Condizionale | P0 |
| Backup | 🔴 | Condizionale | P1 |
| Logging | 🟡 | No | P2 |
| Monitoraggio | 🔴 | No (pilot) | P2 |

---

## Decisione go-live

| Verdetto | Condizione |
|----------|------------|
| ✅ **Go-live pilot interno** | Migration applicate + env Vercel + utenti creati + team informato su email/WhatsApp/automazioni |
| ❌ **Go-live “chiavi in mano” senza ops** | Migration e env obbligatori |
| ❌ **Go-live con invii reali email/WhatsApp** | Richiede integrazione provider (fuori v1.0) |
| ❌ **Go-live con automazioni eseguite** | Richiede worker/cron (fuori v1.0) |

---

## Riferimenti rapidi

| Risorsa | Path / comando |
|---------|----------------|
| Template env | `.env.local.example` |
| Applicare migration | `npm run supabase:apply-migrations` |
| Verifica DB | `npm run supabase:verify` |
| Bootstrap utente test | `npm run bootstrap:sprint3` |
| Smoke test completi | `npm run test` |
| Report RC1 | `RELEASE_READINESS.md` |
| Stato progetto | `PROJECT_STATUS.md` |

---

*Documento generato da audit operativo Go Live — nessuna modifica al codice applicata.*
