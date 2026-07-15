# Yagiu OS — ROADMAP 2.0

**Obiettivo:** portare alla **v1.0** tutto ciò che esiste già nel codice, senza aggiungere nuove funzionalità.  
**Base:** `PROJECT_STATUS.md` (audit 15 luglio 2026).  
**Principio:** ogni fase completa moduli/schermate/workflow **già presenti** nell'UI o nello schema.

---

## Stato di partenza

| Già production-ready | Da completare |
|---------------------|---------------|
| Tour (CRUD + 7 tab + storage) | 8 servizi mock → Supabase |
| Preventivi (CRUD + conversione) | Tab cliente Viaggi/Pagamenti |
| Pagamenti overview | Dashboard/Report KPI mock |
| Auth base (login, RLS org) | schema.sql → migration |
| | Audit write-through |
| | Notifiche generazione |
| | Permessi reali |

**Completamento attuale:** **98%** (Fase 7.2 completata — v1.0 non raggiunta)

**Fase 1 completata** — zero mock nei servizi marketing/comunicazioni (1.1–1.7).

**Baseline stabile:** bootstrap, verify, test (auth/tour/preventivi) — verdi.

**Fase 0 completata** — DB ricreabile solo da migration numerate.

---

## Fase 0 — Integrità database (bloccante)

> Nessun wiring frontend finché lo schema non è consistente tra ambienti.

### 0.1 Riparare migration esistenti
- [x] Rimuovere testo non-SQL da `20260715200000_sprint_2_preventivi.sql` (righe 141–143)
- [x] Correggere RLS `comunicazione_eventi` in Sprint 3: usare `cliente_id` (come in `schema.sql`), non `comunicazione_id`
- [x] Verificare idempotenza di tutte le migration con `npm run supabase:apply-migrations`

### 0.2 Migration unificata `schema.sql`
Creare migration numerata che porti in repo tutto ciò che oggi è solo in `supabase/schema.sql`:

- [x] `clienti` (se non già presente via schema manuale)
- [x] `cliente_questionari`
- [x] `comunicazioni`, `comunicazione_eventi`
- [x] `email_templates`, `email_invii`
- [x] `whatsapp_conversazioni`, `whatsapp_invii`, `whatsapp_templates`
- [x] `schedulazioni`, `automazioni`
- [x] `audit_log`, `notifiche`
- [x] `cliente_timeline_eventi`

Ogni tabella: `CREATE IF NOT EXISTS`, indici, trigger, `organization_id` dove previsto da Sprint 3, GRANT + `NOTIFY pgrst`.

**File:** `supabase/migrations/20260715090000_sprint_0_legacy_schema.sql`

### 0.3 Tooling deploy
- [x] Completare `npm run bootstrap:sprint3` end-to-end (service role key documentata)
- [x] `npm run supabase:verify` verde su tutte le tabelle
- [x] `npm run test` verde (auth + tour + preventivi)

**Criterio di uscita:** stesso DB ricreabile solo da migration numerate, zero dipendenza da SQL manuale.

---

## Fase 1 — Wiring servizi mock → Supabase (schema già definito)

> Ordine: dal più vicino al core operativo al più periferico.

### 1.1 Cliente — questionario
**Esiste:** tab UI `ClienteSchedaQuestionario`, tabella `cliente_questionari` in schema, service mock.  
- [x] Riscrivere `cliente-questionario.service.ts` su Supabase
- [x] Aggiungere tipi in `database.ts`
- [x] Rimuovere dipendenza da `@/mock/cliente-questionari` in service e global-search

### 1.2 Cliente — timeline write
**Esiste:** read Supabase, write mock su invio email/WhatsApp.  
- [x] `email-invio.service.ts` → persistere su `cliente_timeline_eventi` (già esiste `recordClienteTimelineEvent`)
- [x] `whatsapp.service.ts` → stesso pattern
- [x] Rimuovere `insertClienteTimelineEmailMock` / `insertClienteTimelineWhatsAppMock` dai flussi principali
- [x] Eliminare `src/mock/cliente-timeline.ts` e aggiornare `global-search.mapper.ts`

### 1.3 Comunicazioni
**Esiste:** UI `ComunicazioniShell`, tabelle `comunicazioni`, `comunicazione_eventi`.  
- [x] `comunicazione.service.ts` → Supabase
- [x] `email-template.service.ts` → `email_templates`
- [x] Tipi `database.ts`
- [x] Eliminare `src/mock/email-templates.ts`; ridurre `comunicazioni.ts` (insert mock invii restano per Fase 1.4/1.5)

### 1.4 Email invii
**Esiste:** `ClienteInviaEmailModal`, tabella `email_invii`, simulazione attiva.  
- [x] `email-invio.service.ts` → Supabase `email_invii`
- [x] Eliminare mock `src/mock/email-invio.ts` e delay simulazione
- [x] Tipi `database.ts`
- [x] Aggiornare toast UI (rimuovere "simulazione") — fuori scope servizio

### 1.5 WhatsApp
**Esiste:** `WhatsAppView`, `ClienteInviaWhatsAppModal`, tabelle whatsapp.  
- [x] `whatsapp.service.ts` → Supabase (`whatsapp_invii`, `whatsapp_conversazioni`, `whatsapp_templates`)
- [x] Eliminare mock `src/mock/whatsapp.ts` e `src/mock/comunicazioni.ts`
- [x] Eliminare delay simulazione e tipi `database.ts`
- [x] Rimuovere toast simulazione — fuori scope servizio

### 1.6 Programmazione
**Esiste:** `ProgrammazioneView`, tabella `schedulazioni`.  
- [x] `schedulazione.service.ts` → Supabase
- [x] Rimuovere clienti mock hardcoded (`mock-c1`, ecc.)
- [x] Eliminare `src/mock/schedulazioni.ts` e tipi `database.ts`

### 1.7 Automazioni
**Esiste:** `AutomazioniView`, tabella `automazioni`.  
- [x] `automazione.service.ts` → Supabase
- [x] Eliminare `src/mock/automazioni.ts` e tipi `database.ts`

**Criterio di uscita:** zero import `@/mock/*` nei servizi di produzione Fase 1 ✅

---

## Fase 2 — Scheda cliente (tab già in navigazione)

> Le tab sono definite in `scheda-sections.ts`; alcune cadono nel placeholder.

### 2.1 Tab Viaggi
**Esiste:** voce tab, placeholder.  
- [x] Componente `ClienteSchedaViaggi` — lista tour via `getTourByClienteId` (`tour_participants` + `getTours`)
- [x] Partizione attivi/storico con `partitionTourClienteViews`
- [x] Nessuna nuova entità — riusa dati tour esistenti

### 2.2 Tab Pagamenti
**Esiste:** voce tab, placeholder.  
- [x] Componente `ClienteSchedaPagamenti` — aggrega `tour_payments` per `cliente_id` del partecipante
- [x] `getPagamentiByClienteId` in `pagamento.service.ts`
- [x] Mapper `mapClientePagamentiData` / `computeClientePagamentiRiepilogo`

### 2.3 Tab Documenti
**Esiste:** UI `ClienteSchedaDocumenti`, service mock, nessuna tabella DB in migration.  
- [x] Valutato: `cliente_documenti` (shape in `cliente-documento.ts`) — migration fuori scope vincoli milestone
- [x] Tipi `cliente_documenti` in `database.ts`
- [x] `cliente-documento.service.ts` → Supabase (`getDocumentiByClienteId`, `listAllDocumenti`)
- [x] Eliminato `src/mock/cliente-documenti.ts`; global-search usa servizio

### 2.4 Tab Note
**Esiste:** `ProfiloViaggiatoreNoteStaff`, dati da `note-staff.data.ts`.  
- [x] Tipi `cliente_note_staff` in `database.ts`
- [x] `cliente-note-staff.service.ts` → Supabase (`getNoteStaffByClienteId`)
- [x] `ProfiloViaggiatoreNoteStaff` wired al servizio (read Supabase)
- [x] Eliminato `note-staff.data.ts` e `getNoteStaffPlaceholder`

### 2.5 Panoramica — sotto-sezioni
**Esiste:** layout completo, dati da `.data.ts` statici.  
- [x] `ProfiloViaggiatoreRelazioni` → `relazioni-viaggiatore.service.ts` (`tour_staff`, `tour_participants`, `room_assignments`)
- [x] `ProfiloViaggiatorePreferenze` → `preferenze-viaggiatore.service.ts` (`cliente_questionari`)
- [x] `ProfiloViaggiatoreDocumenti` → `documenti-viaggiatore.service.ts` (`cliente_documenti`)
- [x] Eliminati `relazioni-viaggiatore.data.ts`, `preferenze-viaggiatore.data.ts`, `documenti-viaggiatore.data.ts`

**Criterio di uscita:** nessun `ClienteSchedaSectionPlaceholder` su tab definite in `CLIENTE_SCHEDA_SEZIONI`.

---

## Fase 3 — Audit, notifiche, registro (infrastruttura già wired parzialmente)

### 3.1 Audit write-through
**Esiste:** `recordAuditLog`, usato in `preventivo.service.ts` e servizi core.  
- [x] Chiamare `recordAuditLog` su mutazioni in: `clienti`, `tour`, `pagamento`, `camera`, `tour-partecipazione`
- [x] Costanti tipo già in `src/lib/audit/constants.ts`

### 3.2 Notifiche — generazione
**Esiste:** `notifica.service.ts` read Supabase, `notifica-record.service.ts`, UI `NotificationCenter`.  
- [x] Generare notifiche su eventi già implementati: preventivo stato, pagamento, scadenza documento tour, partenza tour
- [x] Usare tipi già in CHECK constraint `notifiche.tipo`

### 3.3 Registro
**Esiste:** `/registro` con `AuditLogView`.  
- [x] Verificare popolamento con write-through Fase 3.1
- [x] Rimuovere silent no-op in dev/staging (o log warning)

**Criterio di uscita:** `/registro` mostra eventi da tutte le operazioni core; notifiche popolate su workflow esistenti.

---

## Fase 4 — Dashboard, report, ricerca (rimuovere mock residui)

### 4.1 Dashboard KPI
**Esiste:** widget con dati reali su KPI numerici, compleanni e liberatorie.  
- [x] Sostituire `MOCK_COMPLEANNI_MESE` con query su `clienti.data_nascita`
- [x] Sostituire `MOCK_LIBERATORIE_MANCANTI` con query su `tour_checklist_completions` (voce `contratto`)
- [ ] Rimuovere `DOMAIN_MOCK_*` da analytics (`domain/selectors`) se sostituiti

### 4.2 Report
- [x] Allineare `ReportView` a dashboard aggiornata (stesso service)

### 4.3 Ricerca globale
- [x] Rimuovere `GLOBAL_SEARCH_STATIC_ENTRIES` e seed mock da `global-search.mapper.ts`
- [x] Indicizzare solo dati Supabase reali

**Criterio di uscita:** zero import `@/mock/dashboard` e `@/mock/global-search-index` in mapper di produzione.

---

## Fase 5 — Auth & tenant (completare multi-tenant esistente)

### 5.1 UI sessione
- [x] Sidebar footer da `useAuth()` (nome, ruolo da `memberships.role_key`)
- [x] Workspace label da `workspaceRepository`

### 5.2 Permessi
**Esiste:** `permissionEngine`, `roleEngine`, catalogo ruoli idratato da DB.  
- [x] Migration tabelle `roles`, `permissions`, `role_permissions` (shape già in `src/tenant/interfaces/`)
- [x] Supabase repos al posto dei mock
- [x] Seed ruoli da catalogo sistema in migration SQL

### 5.3 RLS legacy tables
- [x] Estendere policy org-scoped a `email_*`, `whatsapp_*`, `schedulazioni`, `automazioni` (oggi solo `auth.uid() IS NOT NULL`)

**Criterio di uscita:** `permissionEngine.hasPermission` riflette DB; nessun mock in `tenant/repositories/index.ts`.

---

## Fase 6 — AI Assistant (collegare provider esistente)

**Esiste:** orchestrator, 5 tool Supabase, UI chat, `llm.provider.ts` OpenAI.  
- [x] Implementare provider reale in `llm.provider.ts` (interfaccia già definita in `llm.provider.types.ts`)
- [x] Rimuovere testo "modalità mock" da `AiAssistantView.tsx`
- [x] Nessun nuovo tool — usare i 5 già registrati in `src/ai/tools/`

**Criterio di uscita:** chat risponde via LLM collegato interrogando tool esistenti.

---

## Fase 7 — Pulizia e qualità v1.0

### 7.1 Dead code
- [x] Rimuovere mock non importati: `tours.ts`, `camere.ts`, `pagamenti.ts`, `tour-partecipazioni.ts`, `notifiche.ts`, `audit-log.ts`
- [x] Rimuovere mock tenant repos non esportati se sostituiti
- [x] Rimuovere `.data.ts` placeholder sostituiti in Fase 2

### 7.2 Types
- [x] Completare `database.ts` per tutte le tabelle migrate in Fase 0

### 7.3 Test
- [x] Smoke test comunicazioni (se service wired)
- [x] Smoke test cliente questionario
- [x] Smoke test auth con permessi
- [ ] Opzionale: Playwright su flussi tour + login (peer dependency già in lockfile)

### 7.4 Hardening
- [x] `loading.tsx` / `error.tsx` per route principali (opzionale ma route già esistono)
- [x] Rimuovere silent no-op PGRST205 in produzione (fail loud o metriche)

**Criterio di uscita v1.0:** `npm run build && npm run lint && npm run test && npm run supabase:verify` tutti verdi; `PROJECT_STATUS.md` ≥ 95% checklist.

---

## Ordine riassuntivo (sequenza ottimale)

```
Fase 0  DB integrity          ████████░░  bloccante
Fase 1  Wire mock services    ███████░░░  8 servizi
Fase 2  Scheda cliente        ██████░░░░  5 tab
Fase 3  Audit + notifiche     ████████░░  completata (M3)
Fase 4  Dashboard/search      ████████░░  completata
Fase 5  Auth/permessi         ████████░░  completata
Fase 6  AI provider           ████████░░  completata
Fase 7  Pulizia + test v1.0   ██████████  completata (7.4.2)
```

### Dipendenze critiche

| Fase | Dipende da |
|------|------------|
| 1.x | 0.x (tabelle in DB) |
| 2.3 Documenti | 0.x + decisione schema (types esistono) |
| 3.x | 1.x (eventi comms generano timeline/notifiche) |
| 4.x | 3.x (dati reali per KPI) |
| 5.2 Permessi | 0.x (migration ruoli) |
| 6 | 1–4 (tool devono restituire dati reali) |
| 7 | tutte |

### Parallelizzabile

- **Fase 1.3–1.7** (comunicazioni, whatsapp, programmazione, automazioni) in parallelo dopo 0.2
- **Fase 2.1 e 2.2** (viaggi/pagamenti tab) in parallelo — solo UI + query
- **Fase 4 e 5.1** in parallelo

---

## Cosa NON è in roadmap (fuori scope v1.0)

Questi elementi **non esistono nel codice** e non vanno aggiunti per raggiungere la v1.0:

- Nuovi moduli di navigazione
- Nuove entità business non presenti in types/schema
- API server-side (`src/app/api`)
- Integrazioni esterne non stubbate (SendGrid, Twilio, Meta WhatsApp API) — il wiring va su tabelle `email_invii` / `whatsapp_invii` già definite
- Multi-organizzazione self-service / billing

---

## Milestone

| Milestone | Fase | Completamento atteso |
|-----------|------|---------------------|
| **M0 — DB affidabile** | 0 | ✅ Completata (70%) |
| **M1 — Zero mock services** | 1 | 78% |
| **M2 — Cliente completo** | 2 | 84% |
| **M3 — Osservabilità** | 3 | 88% |
| **M4 — Analytics reali** | 4 | ✅ Completata (93%) |
| **M5 — Tenant sicuro** | 5 | ✅ Completata (96%) |
| **M6 — AI operativo** | 6 | ✅ Completata (97%) |
| **v1.0** | 7 | ≥ 98% |

---

## Verifica finale v1.0

```bash
npm run supabase:verify
npm run test
npm run build
npm run lint
```

Checklist rapida:
- [x] 0 import `@/mock/*` in `src/services/` (escluso test)
- [x] 0 `ClienteSchedaSectionPlaceholder` su tab definite
- [x] 0 toast "simulazione" nei flussi principali
- [x] `recordAuditLog` su tutti i servizi di mutazione core
- [x] Sidebar mostra utente autenticato
- [x] `permissionEngine` senza mock repository

---

*Roadmap derivata dall'audit codice — nessuna nuova funzionalità, solo completamento dell'esistente.*
