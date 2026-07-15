# Yagiu OS — Release Readiness Report (RC1)

**Data audit:** 15 luglio 2026  
**Versione:** `0.1.0`  
**Ambito:** audit pre-produzione senza modifiche al codice  
**Riferimenti:** `PROJECT_STATUS.md`, `ROADMAP_2_0.md` (v1.0 + Verifica finale completate)

---

## Executive summary

L'applicazione è **tecnicamente deployabile** come pilot interno single-tenant: build, lint, smoke test e verifica Supabase sono tutti verdi sull'ambiente auditato. I flussi core (auth, tour, preventivi, clienti, comunicazioni, pagamenti) persistono su Supabase con RLS org-scoped verificato dagli smoke test.

Il go-live **non è plug-and-play**: richiede provisioning manuale di Supabase (8 migration), variabili Vercel, creazione utenti Auth e runbook operativo. Senza questi passaggi l'app non è utilizzabile in produzione.

**Livello di confidenza release: 76%**

| Scenario | Confidenza |
|----------|------------|
| Deploy Vercel + Supabase configurato + utenti creati | **85%** |
| Go-live pubblico multi-team senza runbook | **45%** |
| Solo build/deploy senza setup DB/env | **15%** |

---

## Verifiche automatiche eseguite (RC1)

| Comando | Esito | Note |
|---------|-------|------|
| `npm run lint` | ✅ PASS | Exit 0 |
| `npm run build` | ✅ PASS | 23 route generate, TypeScript OK |
| `npm run test` | ✅ PASS | 6 smoke test sequenziali OK |
| `npm run supabase:verify` | ✅ PASS | 41 tabelle + auth test user OK |

**Warning osservati (non bloccanti build):**
- `npm warn Unknown env config "devdir"` — configurazione npm locale, non del progetto

---

## Cosa è pronto

### Build & qualità codice
- Next.js 16.2.10 compila senza errori TypeScript/ESLint
- Nessun `src/app/api/**` (architettura client-side Supabase documentata)
- Nessun import `@/mock/*` nei servizi
- `loading.tsx` / `error.tsx` sul segmento dashboard
- PGRST205: fail loud in produzione (`src/lib/supabase/missing-table.ts`)

### Database & backend
- 8 migration numerate in `supabase/migrations/` (Sprint 0 → 5.3)
- Script operativi: `supabase:apply-migrations`, `bootstrap:sprint3`, `supabase:verify`
- 41 tabelle applicative verificate accessibili
- RLS org-scoped (Sprint 3) — smoke auth conferma blocco insert anon su `clienti`
- Ruoli/permessi in DB (Sprint 5.2) — smoke auth-permissions OK
- Storage bucket `tour-documents` definito in migration Sprint 1A

### Autenticazione & routing
- Middleware attivo su tutte le route (esclusi asset statici)
- Redirect non autenticati → `/login?next=`
- Redirect autenticati da route auth → `/`
- Sessione Supabase SSR (`@supabase/ssr`) + `AuthProvider`
- Pagine auth: `/login`, `/recupera-password`, `/aggiorna-password`

### Route applicative (24 `page.tsx`)

| Route | Nav sidebar | Stato |
|-------|-------------|-------|
| `/` | ✅ | Dashboard KPI reali |
| `/clienti`, `/clienti/[id]` | ✅ | CRUD lista + scheda 7 tab |
| `/tour`, `/tour/nuovo`, `/tour/[id]`, `/tour/[id]/modifica` | ✅ | CRUD + 7 tab scheda |
| `/preventivi`, `/preventivi/nuovo`, `/preventivi/[id]` | ✅ | CRUD + conversione |
| `/pagamenti` | ✅ | Overview cross-tour |
| `/comunicazioni` | ✅ | Dashboard Supabase |
| `/whatsapp` | ✅ | Conversazioni + invii DB |
| `/programmazione` | ✅ | Schedulazioni Supabase |
| `/automazioni` | ✅ | Automazioni Supabase |
| `/viaggi` | ✅ | Vista aggregata |
| `/calendario` | ✅ | Vista calendario |
| `/report` | ✅ | Allineato a dashboard |
| `/registro` | ✅ | Audit log write-through |
| `/ai` | ✅ | LLM via server action |
| `/impostazioni` | ✅ | Profilo base |

Tutte le voci di `src/config/navigation.ts` hanno una `page.tsx` corrispondente.

### Flussi principali testati (smoke)
1. Auth + profile + membership + RLS
2. Auth permessi (catalogo ruoli/permessi)
3. Tour CRUD end-to-end (hotel, camere, partecipanti, pagamenti, checklist, documenti, programma, timeline)
4. Preventivi CRUD + conversione + audit + notifiche
5. Comunicazioni + template + invii email + eventi
6. Questionario cliente read/write

### Verifica finale v1.0 (roadmap)
- [x] 0 import mock in `src/services/`
- [x] 0 `ClienteSchedaSectionPlaceholder` su tab definite
- [x] 0 toast "simulazione" nei flussi principali
- [x] `recordAuditLog` su mutazioni core
- [x] Sidebar utente da sessione
- [x] `permissionEngine` senza mock repository

---

## Cosa blocca realmente la produzione

### 🔴 Bloccanti operativi (must-have pre-go-live)

| # | Blocco | Impatto | Mitigazione richiesta |
|---|--------|---------|----------------------|
| B1 | **Migration Supabase non applicate** sul progetto di produzione | App crash o `MissingSupabaseTableError` su ogni operazione (fail loud in prod) | Eseguire `npm run supabase:apply-migrations` contro il DB di produzione prima del deploy |
| B2 | **Variabili env mancanti su Vercel** | Client Supabase non si inizializza; middleware bypassa auth se `NEXT_PUBLIC_SUPABASE_*` assenti | Configurare in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID` |
| B3 | **Nessuna UI di registrazione utenti** | Solo login; utenti devono essere creati esternamente (Supabase Dashboard / Admin API / `bootstrap:sprint3`) | Procedura operativa per creare il primo admin e gli utenti team prima del go-live |
| B4 | **Seed organizzazione/workspace** | `handle_new_auth_user()` assegna org/ws fissi (`00000000-...0001/0002`); `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID` deve corrispondere al seed | Verificare che il progetto Supabase di produzione contenga org/workspace seed o adattare env + migration |

### 🔴 Bloccanti funzionali per aspettative business (se richieste in go-live)

| # | Blocco | Impatto |
|---|--------|---------|
| F1 | **Email/WhatsApp non inviano messaggi reali** | `inviaEmailSimulata` / `inviaWhatsAppSimulato` persistono solo su `email_invii` / `whatsapp_invii` — nessun provider esterno (SendGrid, Twilio, Meta) |
| F2 | **AI Assistant richiede `OPENAI_API_KEY`** | Senza la variabile server-side su Vercel, `/ai` fallisce a runtime (server action) |

### 🟠 Rischi sicurezza / configurazione (bloccanti per produzione esposta)

| # | Rischio | Dettaglio |
|---|---------|-----------|
| S1 | **Storage bucket `tour-documents` pubblico** | `public: true` + policy `anon, authenticated` senza vincolo org — chi conosce path può accedere a file |
| S2 | **Middleware bypass se env assenti** | `updateSession` ritorna `NextResponse.next()` senza redirect se Supabase URL/key mancanti — errore di configurazione espone tutte le route |
| S3 | **Permessi non enforced in UI** | `hasPermission` esposto da `useAuth()` ma non cablato sulle viste — tutti gli utenti autenticati vedono tutte le azioni (RLS DB è l'unico gate) |

---

## Consigliato ma non bloccante

| Area | Dettaglio | Priorità |
|------|-----------|----------|
| CI/CD | Nessuna pipeline GitHub Actions / Vercel preview checks | Media |
| Test | Solo 6 smoke Node; nessun Jest/Vitest/Playwright E2E UI | Media |
| `vercel.json` | Assente — deploy default Next.js OK | Bassa |
| README deploy | README è template create-next-app; nessuna guida Yagiu-specific | Alta (operativa) |
| `DOMAIN_MOCK_*` | Ancora in `src/domain/selectors/partecipazione.selectors.ts` (KPI analytics) | Bassa |
| `MOCK_ALLEGATI_DISPONIBILI` | Allegati fittizi in modale invio email (`ClienteInviaEmailModal`) | Bassa |
| `TourSchedaSectionPlaceholder` | Fallback morto in `TourSchedaView` — tutte le 7 tab tour sono wired | Bassa |
| `mapCalendario` | 2 eventi hardcoded nel calendario dashboard oltre ai tour reali | Bassa |
| `getTourPlaceholderData` | Dead code in `src/lib/tour/tour.data.ts` (non importato) | Bassa |
| Impostazioni | Toggle preferenze non collegati a funzionalità reali | Bassa |
| Note staff | Tab read-only (nessun CRUD UI) | Bassa |
| Playwright | Opzionale in roadmap, non eseguito | Bassa |
| npm `devdir` warning | Config locale npm, non progetto | Bassa |

---

## Dettaglio audit per area

### Environment

| Variabile | Runtime | Obbligatoria prod | Presente in `.env.local.example` |
|-----------|---------|-------------------|----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Middleware | ✅ Sì | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Middleware | ✅ Sì | ✅ |
| `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID` | Client | ✅ Sì | ✅ |
| `OPENAI_API_KEY` | Server (AI) | Solo per `/ai` | ✅ (commentata) |
| `SUPABASE_SERVICE_ROLE_KEY` | Script bootstrap | No runtime app | ✅ (commentata) |
| `SUPABASE_DB_URL` | Script migration | No runtime app | ✅ (commentata) |
| `TEST_USER_*` | Smoke test locali | No prod | ✅ (commentata) |

**Nota:** `.env.local` non è versionato (corretto). Produzione dipende interamente dalla configurazione Vercel.

### API server-side

- **0** file `src/app/api/**/route.ts`
- Persistenza 100% via Supabase client nel browser
- AI usa `"use server"` (`src/ai/services/ai-complete.server.ts`) — unica logica server-side

### Middleware

```text
middleware.ts → updateSession → Supabase auth.getUser()
  - no user + non-auth route → redirect /login?next=
  - user + auth route → redirect /
  - env mancanti → NESSUNA protezione (pass-through)
```

### Mock / placeholder nei flussi principali

| Elemento | Flusso principale? | Stato |
|----------|-------------------|-------|
| `@/mock/*` in services | — | ✅ Assente |
| Toast "simulazione" | Email/WhatsApp | ✅ Rimosso |
| `ClienteSchedaSectionPlaceholder` | Scheda cliente | ✅ Rimosso |
| `TourSchedaSectionPlaceholder` | Scheda tour | 🟡 Fallback morto (tab tutte implementate) |
| `MOCK_ALLEGATI_DISPONIBILI` | Invio email cliente | 🟡 UI allegati fittizi |
| `inviaEmailSimulata` / `inviaWhatsAppSimulato` | Comunicazioni | 🟡 Nome funzione; comportamento = persist DB |
| `DOMAIN_MOCK_*` | Dashboard analytics | 🟡 2 KPI derivati |

### Dipendenze

`npm ls --depth=0` — tutte le dipendenze dichiarate risolte, nessun peer dependency mancante critico.

### Configurazione Vercel / produzione

| Elemento | Stato |
|----------|-------|
| `vercel.json` | ❌ Assente |
| `next.config.ts` | ✅ Default (vuoto) |
| Build command | `next build` (standard) |
| Node version pin | ❌ Non specificato in `package.json` engines |
| Output | Standalone non configurato (default Vercel OK) |

### Errori runtime attesi (senza setup)

| Condizione | Comportamento |
|------------|---------------|
| Env Supabase mancanti | `getBrowserSupabaseClient()` throw; middleware non protegge |
| Tabella DB assente in prod | `MissingSupabaseTableError` (fail loud) |
| `OPENAI_API_KEY` assente | Errore su richiesta AI |
| Utente non in `memberships` | Profilo senza permessi operativi; RLS può bloccare query |
| Upload documenti senza bucket | Errore storage Supabase |

### TODO / FIXME nel codice

Nessun `TODO`/`FIXME` bloccante trovato in `src/`.  
(I match su `METODO_PAGAMENTO` sono enum business, non task pendenti.)

---

## Checklist Go Live

### Fase 1 — Supabase produzione
- [ ] Creare progetto Supabase produzione (separato da dev)
- [ ] Eseguire `npm run supabase:apply-migrations` sul DB produzione
- [ ] Verificare seed `organizations` / `workspaces` (UUID default)
- [ ] Eseguire `npm run supabase:verify` contro env produzione
- [ ] Creare utente/i admin via Supabase Auth Dashboard o Admin API
- [ ] Verificare trigger `handle_new_auth_user` (profile + membership auto)
- [ ] Verificare bucket `tour-documents` e policy storage
- [ ] Configurare backup e monitoring Supabase

### Fase 2 — Vercel
- [ ] Collegare repository a Vercel
- [ ] Impostare env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID`
- [ ] Impostare `OPENAI_API_KEY` (se AI in scope go-live)
- [ ] Deploy preview → smoke manuale login + tour + cliente
- [ ] Promuovere a produzione

### Fase 3 — Verifica post-deploy (manuale)
- [ ] Login con utente reale
- [ ] Creare/modificare un cliente
- [ ] Creare un tour e aggiungere partecipante
- [ ] Registrare un pagamento
- [ ] Creare preventivo e convertire
- [ ] Inviare email/WhatsApp da scheda cliente (verificare record DB)
- [ ] Upload documento tour (verificare storage)
- [ ] Controllare `/registro` per eventi audit
- [ ] Controllare notifiche in TopBar
- [ ] Testare `/ai` (se abilitato)

### Fase 4 — Operativo
- [ ] Documentare runbook creazione utenti (no self-signup)
- [ ] Comunicare al team che email/WhatsApp sono solo tracciamento DB
- [ ] Definire owner per migration future
- [ ] Pianificare CI minima (almeno lint + test su PR)

---

## Decisione RC1

| Verdetto | Dettaglio |
|----------|-----------|
| **RC1 approvata per pilot interno** | ✅ Con setup Supabase + Vercel + utenti |
| **RC1 pronta per go-live pubblico** | ❌ Senza runbook utenti, hardening storage, CI |
| **RC1 pronta senza intervento ops** | ❌ Migration e env obbligatori |

### Livello di confidenza release

```
████████████████░░░░  76%
```

**Motivazione:**
- +25% build/lint/test/verify tutti verdi, smoke coprono flussi core
- +15% auth/RLS/permessi verificati automaticamente
- +10% Verifica finale v1.0 roadmap completata
- +10% architettura coerente e documentata in PROJECT_STATUS
- −10% nessun CI, nessun E2E UI, nessun test upload storage
- −10% provisioning utenti e migration manuali
- −8% email/WhatsApp/AI dipendono da aspettative e env non core
- −6% storage pubblico e permessi UI non enforced

---

## Prossimi passi suggeriti (post-RC1, fuori scope audit)

1. Runbook deploy Yagiu-specific (sostituire README template)
2. Smoke post-deploy su Vercel preview
3. Hardening policy storage `tour-documents`
4. CI: `lint && test && build` su ogni PR

---

*Report generato da audit RC1 — nessuna modifica al codice applicata.*
