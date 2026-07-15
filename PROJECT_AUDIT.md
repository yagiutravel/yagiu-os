# Yagiu OS — Project Audit

**Data audit:** 15 luglio 2026  
**Versione applicazione:** 0.1.0  
**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Supabase JS v2

---

## Sintesi esecutiva

Yagiu OS è un **CRM operativo per tour operator** con UI matura e navigazione completa. L'architettura segue il pattern **View → Service → Supabase / Mock**.

| Metrica | Valore |
|---|---|
| Route dashboard | 18 pagine in `src/app/(dashboard)/` |
| Servizi dati | 18 file in `src/services/` |
| Integrazione Supabase attiva | **1 modulo** (`clienti`) |
| Tabelle definite in `supabase/schema.sql` | **15** |
| Tabelle tipizzate in `src/types/database.ts` | **1** (`clienti`) |
| Layer mock in-memory | **17 file** in `src/mock/` |
| Autenticazione | **Assente** |
| Test automatici | **Assenti** |
| API routes (`src/app/api/`) | **Assenti** |

**Pattern dominante:** frontend production-grade con **un solo dominio persistito** (anagrafica clienti). Tutto il resto opera su dati mock che si perdono al refresh e non sono condivisi tra sessioni.

---

## Legenda stati

| Stato | Significato |
|---|---|
| **Esiste** | Route, componenti e/o servizi presenti nel codice |
| **Non esiste** | Nessuna implementazione nel progetto |
| **Demo/UI** | Interfaccia navigabile, dati statici o simulati, nessuna persistenza reale |
| **Parzialmente funzionante** | Funzionalità operative con mix reale/mock o copertura incompleta |
| **Completamente funzionante** | CRUD end-to-end con persistenza reale e flussi utilizzabili in produzione |

**Priorità gap:** Alta = bloccante per 1.0 · Media = necessario ma non bloccante · Bassa = miglioramento post-1.0

---

## Architettura dati

```
┌─────────────────────────────────────────────────────────────┐
│  UI (src/components/, src/shared/)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Services (src/services/)                                   │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ clienti.service │  │ 17 servizi → src/mock/*           │ │
│  │ → Supabase ✅   │  │ (tour, pagamenti, notifiche…)   │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
  Supabase PostgreSQL                  In-memory mock
  (solo `clienti` wired)               (perso al refresh)
```

**File chiave:**

| Area | Percorso |
|---|---|
| Route | `src/app/(dashboard)/` |
| Navigazione | `src/config/navigation.ts` |
| Client Supabase | `src/config/supabase.ts` |
| Schema DB | `supabase/schema.sql` |
| Tipi DB | `src/types/database.ts` |
| Verifica connessione | `scripts/verify-supabase.mjs` (`npm run supabase:verify`) |

---

## Audit per modulo

---

### 1. Dashboard

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Alta** |
| **Route** | `/` |
| **File principali** | `src/components/dashboard/DashboardView.tsx`, `src/services/dashboard.service.ts`, `src/components/dashboard/widgets/*` |

#### Funzionalità implementate

- Griglia widget: KPI, tour in partenza, pagamenti, documenti, camere, viaggiatori, attività recenti, calendario, avvisi
- Stati loading / errore / retry
- Quick actions (crea cliente → Supabase)
- Ricerca locale dashboard (`DashboardGlobalSearch`)
- Aggregazione metriche da clienti (Supabase) + tour/partecipazioni/camere (mock)
- Invalidazione cache manuale su mutazioni tour

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Dipendenza da Supabase per clienti: se fallisce, dashboard in errore mentre tour mock restano | Alta |
| KPI e widget basati su dati mock non affidabili | Alta |
| Nessun refresh real-time / polling | Media |
| Nessun filtro per periodo o workspace | Media |
| Widget documenti/pagamenti non collegati a storage o pagamenti reali | Alta |

---

### 2. Clienti

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Completamente funzionante** |
| **Priorità gap** | **Alta** (sicurezza e multi-utente) |
| **Route** | `/clienti` |
| **File principali** | `src/components/clienti/ClientiView.tsx`, `src/services/clienti.service.ts` |

#### Funzionalità implementate

- Lista con ricerca, filtro per stato, ordinamento, paginazione
- CRUD completo su Supabase (`getClienti`, `getCliente`, `createCliente`, `updateCliente`, `deleteCliente`)
- Form modale con validazione
- Navigazione verso scheda cliente
- Mapping tipizzato `ClienteRow` ↔ `Cliente`

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Nessuna autenticazione: RLS permissiva (`anon` full access) | Alta |
| `created_by` non popolato (nessun utente auth) | Alta |
| Nessun import/export CSV | Media |
| Nessuna deduplica email/telefono a livello DB | Media |
| Nessun audit log su mutazioni | Media |

---

### 3. Scheda Cliente

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Alta** |
| **Route** | `/clienti/[id]` |
| **File principali** | `src/components/clienti/ClienteSchedaView.tsx`, `src/lib/clienti/scheda-sections.ts` |

#### Funzionalità implementate

| Sezione | Stato | Dati |
|---|---|---|
| Panoramica | UI completa | Supabase + placeholder statici (preferenze, relazioni) |
| Timeline | UI completa | Mock (`cliente-timeline.service.ts`) |
| Viaggi | Placeholder | `ClienteSchedaSectionPlaceholder` |
| Pagamenti | Placeholder | `ClienteSchedaSectionPlaceholder` |
| Documenti | Read-only | Mock metadata (`cliente-documento.service.ts`) |
| Questionario | Read-only | Mock (`cliente-questionario.service.ts`) |
| Note staff | UI statica | `note-staff.data.ts` |
| Invia Email / WhatsApp | Modali funzionanti | Simulazione → aggiorna mock timeline |

- Header profilo viaggiatore con azioni rapide
- Tab bar 7 sezioni
- Caricamento anagrafica da Supabase con gestione 404

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Tab Viaggi e Pagamenti vuote | Alta |
| Timeline, documenti, questionario non su Supabase (tabelle `cliente_timeline_eventi`, `cliente_questionari` esistono ma non sono wired) | Alta |
| Note staff non persistite | Media |
| Invio email/WhatsApp simulato, nessun provider reale | Alta |
| Nessuna modifica questionario/documenti dall'UI | Alta |

---

### 4. Tour

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Alta** |
| **Route** | `/tour`, `/tour/nuovo`, `/tour/[id]`, `/tour/[id]/modifica` |
| **File principali** | `src/components/tour/*`, `src/services/tour.service.ts`, `src/mock/tours.ts` |

#### Funzionalità implementate

- Lista tour con filtri, ricerca, stati badge
- CRUD tour (create, read, update, delete, archivia)
- Form creazione/modifica con validazione
- Scheda tour con 7 tab:
  - **Timeline** — UI mock
  - **Partecipanti** — CRUD completo (mock + clienti reali da Supabase)
  - **Camere** — CRUD rooming (mock)
  - **Pagamenti** — CRUD per tour (mock)
  - **Documenti, Programma, Checklist** — placeholder
- 8 tour seed in memoria
- Invalidazione cache dashboard e ricerca globale

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Nessuna tabella tour/partecipazioni/camere in `schema.sql` | Alta |
| Dati persi al refresh | Alta |
| Sezioni documenti/programma/checklist non implementate | Media |
| Nessun collegamento a preventivi | Alta |
| Nessun export PDF contratti/itinerari | Bassa |

---

### 5. Viaggi

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Demo/UI** |
| **Priorità gap** | **Media** |
| **Route** | `/viaggi` |
| **File principali** | `src/components/viaggi/ViaggiView.tsx` |

#### Funzionalità implementate

- Vista raggruppata: In corso / Prossimi / Recenti
- Link verso scheda tour
- Derivata da `getTours()` (mock)

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Non è un dominio autonomo — solo filtro UI sui tour | Media |
| Nessun workflow prenotazione/iscrizione | Alta |
| Nessuna persistenza | Alta |

---

### 6. Preventivi

| Campo | Valore |
|---|---|
| **Stato** | **Non esiste** |
| **Priorità gap** | **Alta** |
| **Route** | — |
| **File principali** | — |

#### Funzionalità implementate

Nessuna. Nessun riferimento a "preventiv*" in route, servizi, tipi o schema.

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Intero modulo da creare: schema DB, tipi, servizio, UI lista/dettaglio/creazione | Alta |
| Collegamento tour ↔ preventivo ↔ pagamenti | Alta |
| Generazione PDF / invio al cliente | Media |
| Voce in navigazione | Media |

---

### 7. Pagamenti

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Alta** |
| **Route** | `/pagamenti` + tab in scheda tour |
| **File principali** | `src/components/pagamenti/PagamentiOverviewView.tsx`, `src/components/tour/TourSchedaPagamenti.tsx`, `src/services/pagamento.service.ts` |

#### Funzionalità implementate

- Overview globale: incassato / in sospeso per tour attivi
- CRUD pagamenti per tour (acconto, saldo, ecc.)
- Riepilogo percentuali per partecipante
- Seed automatico da partecipazioni mock
- Widget dashboard pagamenti

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Nessuna tabella pagamenti in Supabase | Alta |
| Dati persi al refresh | Alta |
| Tab pagamenti in scheda cliente è placeholder | Alta |
| Nessuna integrazione Stripe/bonifico/fatturazione | Alta |
| Nessuna riconciliazione automatica | Media |

---

### 8. Calendario

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Demo/UI** |
| **Priorità gap** | **Media** |
| **Route** | `/calendario` |
| **File principali** | `src/components/calendario/CalendarioView.tsx`, `src/components/dashboard/widgets/CalendarioWidget.tsx` |

#### Funzionalità implementate

- Tour raggruppati per mese di `dataPartenza`
- Link a scheda tour
- Widget calendario in dashboard (prossime partenze)

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Lista per mese, non calendario a griglia | Media |
| Dati mock | Alta |
| Nessuna sincronizzazione iCal/Google Calendar | Bassa |
| Nessun drag-and-drop o pianificazione | Bassa |
| Non integrato con `/programmazione` | Media |

> **Nota:** `/programmazione` è un modulo separato (scheduler comunicazioni), non il calendario operativo.

---

### 9. Comunicazioni

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Alta** |
| **Route** | `/comunicazioni` |
| **File principali** | `src/components/comunicazioni/ComunicazioniShell.tsx`, `ComunicazioniView.tsx`, `template-email/EmailTemplateView.tsx`, `src/services/comunicazione.service.ts`, `email-template.service.ts`, `email-invio.service.ts` |

#### Funzionalità implementate

- Shell a tab: Centro comunicazioni / Template email
- Widget email, reminder, WhatsApp con conteggi
- Timeline milestone per cliente
- CRUD template email (create, edit, duplicate, delete) — mock
- Invio email simulato da scheda cliente
- Nomi clienti da Supabase quando disponibile

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Tabelle `comunicazioni`, `comunicazione_eventi`, `email_templates`, `email_invii` in schema ma non wired | Alta |
| Nessun provider SMTP/SendGrid/Resend | Alta |
| Invii simulati, nessuna delivery tracking reale | Alta |
| WhatsApp gestito su route separata (`/whatsapp`), non integrato qui | Media |
| Nessun collegamento con `/programmazione` per invii schedulati | Media |

---

### 10. AI Assistant

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Media** |
| **Route** | `/ai` |
| **File principali** | `src/components/ai-assistant/AiAssistantView.tsx`, `src/ai/` (orchestrator, tools, planner, memory) |

#### Funzionalità implementate

- UI chat multi-conversazione (in-memory, non persistita)
- Motore tool-based: planner keyword → esecuzione tool → formattazione risposta markdown
- Tool disponibili: search clients, tours, payments, dashboard, documents
- Architettura estensibile (registry, context builder, prompt builder)
- Risposte esplicite su dati mock/hybrid

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| LLM provider stub (`llm.provider.ts` — `complete()` lancia errore) | Media |
| Nessuna integrazione OpenAI/Anthropic | Media |
| Conversazioni non persistite | Bassa |
| Nessun contesto auth-scoped | Alta (dipende da auth) |
| Nessun rate limiting / cost control | Media |

---

### 11. Report

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Demo/UI** |
| **Priorità gap** | **Media** |
| **Route** | `/report` |
| **File principali** | `src/components/report/ReportView.tsx` |

#### Funzionalità implementate

- 4 KPI card (clienti, tour attivi, partecipanti, occupazione media)
- Lista attività recenti (8 elementi)
- Riusa `getDashboardData()` — nessuna query dedicata

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Nessun grafico o trend temporale | Media |
| Nessun export PDF/CSV/Excel | Media |
| Nessun filtro per data, tour, operatore | Media |
| Nessun report finanziario dedicato | Alta |
| Duplicazione funzionale della dashboard | Bassa |

---

### 12. Registro attività

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Demo/UI** |
| **Priorità gap** | **Media** |
| **Route** | `/registro` |
| **File principali** | `src/shared/components/audit-log/AuditLogView.tsx`, `src/services/audit-log.service.ts` |

#### Funzionalità implementate

- Tabella audit log con ricerca testuale
- Filtro per tipo entità
- Dati seed mock (login, creazione cliente, invio email, ecc.)

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Tabella `audit_log` in schema ma non wired | Media |
| Nessuna scrittura automatica su CRUD reali | Alta |
| Dati mock statici | Media |
| Nessun filtro per utente/data/azione | Bassa |

---

### 13. Automazioni

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Media** |
| **Route** | `/automazioni` |
| **File principali** | `src/components/automazioni/AutomazioniView.tsx`, `src/services/automazione.service.ts` |

#### Funzionalità implementate

- Card riepilogo (attivi, inattivi, bozze)
- Tabella con ricerca e filtro stato
- Creazione regola (trigger → azione) via modale
- 5 automazioni seed

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Tabella `automazioni` in schema ma non wired | Media |
| Nessun motore di esecuzione (regole non si attivano) | Alta |
| Nessun update/delete nel servizio | Media |
| Nessun log esecuzioni | Media |
| Nessun collegamento a eventi business reali | Alta |

---

### 14. Impostazioni

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Demo/UI** |
| **Priorità gap** | **Media** |
| **Route** | `/impostazioni` |
| **File principali** | `src/components/impostazioni/ImpostazioniView.tsx` |

#### Funzionalità implementate

- 3 toggle: notifiche email, reminder automatici, vista compatta
- Toast "salvate localmente" al click Salva
- Stato React locale — nessuna persistenza

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Preferenze non salvate su DB o localStorage | Media |
| Nessun profilo utente / team | Alta |
| Nessuna gestione integrazioni (SMTP, WhatsApp API, Stripe) | Alta |
| Layer tenant scaffold (`src/tenant/`) esiste ma non usato in UI | Media |
| Toggle non collegati al centro notifiche | Media |

---

### 15. Autenticazione

| Campo | Valore |
|---|---|
| **Stato** | **Non esiste** |
| **Priorità gap** | **Alta** |
| **Route** | — |
| **File principali** | Solo config client in `src/config/supabase.ts` (`persistSession: true`, mai usato) |

#### Funzionalità implementate

- Client Supabase configurato con `auth.persistSession` e `autoRefreshToken`
- Colonna `clienti.created_by` referenzia `auth.users` nello schema

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Nessuna route `/login`, `/signup`, callback OAuth | Alta |
| Nessun `middleware.ts` per route protette | Alta |
| Nessun provider sessione / hook `useUser` | Alta |
| App completamente aperta se deployata | Alta |
| RLS permissiva su tutte le tabelle | Alta |
| Layer ruoli/permessi (`src/tenant/`) non integrato | Media |

---

### 16. Database Supabase

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Alta** |
| **File principali** | `supabase/schema.sql`, `src/types/database.ts`, `src/config/supabase.ts`, `scripts/verify-supabase.mjs` |

#### Funzionalità implementate

- Schema SQL completo per 15 tabelle con indici, trigger `updated_at`, RLS, commenti
- CRUD `clienti` wired e funzionante
- Script verifica connessione (`npm run supabase:verify`)
- Tipi TypeScript per tabella `clienti`

#### Tabelle in schema

| Tabella | Wired nel codice |
|---|---|
| `clienti` | ✅ |
| `cliente_questionari` | ❌ |
| `cliente_timeline_eventi` | ❌ |
| `comunicazioni` | ❌ |
| `comunicazione_eventi` | ❌ |
| `email_templates` | ❌ |
| `email_invii` | ❌ |
| `notifiche` | ❌ |
| `audit_log` | ❌ |
| `whatsapp_conversazioni` | ❌ |
| `whatsapp_invii` | ❌ |
| `whatsapp_templates` | ❌ |
| `schedulazioni` | ❌ |
| `automazioni` | ❌ |

#### Tabelle assenti dallo schema (domini mock-only)

- `tours`, `partecipazioni`, `camere`, `pagamenti`, `preventivi`
- `cliente_documenti` (né tabella né Supabase Storage)

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Migrare domini core (tour, pagamenti) su Supabase | Alta |
| Wire tabelle schema esistenti (timeline, questionari, comunicazioni…) | Alta |
| Estendere `database.ts` con tutti i tipi | Alta |
| RLS per-utente invece di `USING (true)` | Alta |
| Supabase Storage per file | Alta |
| Migrazioni versionate (non solo `schema.sql` manuale) | Media |
| Backup e monitoring | Media |

---

### 17. Ricerca globale

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Media** |
| **Attivazione** | `Ctrl+K` / `⌘K` (TopBar) |
| **File principali** | `src/shared/components/search/GlobalSearchProvider.tsx`, `GlobalSearchModal.tsx`, `src/services/global-search.service.ts` |

#### Funzionalità implementate

- Shortcut tastiera con label SSR-safe
- Modale ricerca con categorie raggruppate
- Categorie indicizzate: clienti, tour, pagamenti, camere, documenti, questionari, timeline, voci statiche dashboard
- Clienti da Supabase; resto da mock con seed on-build
- Invalidazione cache su mutazioni tour
- Ricerca dashboard separata (scope ridotto)

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Indice in-memory, non aggiornato su tutte le mutazioni | Media |
| Nessuna full-text search Supabase | Bassa |
| Categorie mock possono mostrare dati obsoleti | Media |
| Nessuna ricerca cross-workspace (multi-tenant) | Bassa |

---

### 18. Notifiche

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** |
| **Priorità gap** | **Media** |
| **Attivazione** | Campanella in TopBar |
| **File principali** | `src/shared/components/notifiche/NotificationCenter.tsx`, `src/services/notifica.service.ts` |

#### Funzionalità implementate

- Badge conteggio non lette
- Pannello con filtri stato (tutte/lette/non lette) e tipo
- Segna come letta / segna tutte come lette
- Navigazione via `href` su click
- 12 notifiche seed mock

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Tabella `notifiche` in schema ma non wired | Media |
| Nessuna generazione da eventi business (pagamento, partenza, documento scaduto) | Alta |
| Nessuna push notification / email digest | Bassa |
| Toggle impostazioni non collegati | Media |
| Dati persi al refresh | Media |

---

### 19. File e Documenti

| Campo | Valore |
|---|---|
| **Stato** | **Esiste** — **Parzialmente funzionante** (embedded, no modulo standalone) |
| **Priorità gap** | **Alta** |
| **Route standalone** | **Non esiste** (`/documenti` assente) |
| **File principali** | `src/components/clienti/ClienteSchedaDocumenti.tsx`, `src/services/cliente-documento.service.ts`, `src/components/dashboard/widgets/DocumentiWidget.tsx` |

#### Funzionalità implementate

- Tab Documenti in scheda cliente: passaporto, CI, visto, assicurazione
- Badge stato/scadenza documenti
- Preview statica in panoramica (`ProfiloViaggiatoreDocumenti.tsx`)
- Widget dashboard documenti in scadenza
- Categoria "documenti" in ricerca globale
- Tool AI `search-documents`

#### Superfici non implementate

- Tab Documenti in scheda tour → placeholder
- Nessuna route `/documenti` dedicata

#### Mancante per production-ready

| Gap | Priorità |
|---|---|
| Nessun upload/download file | Alta |
| Nessun Supabase Storage | Alta |
| Nessuna tabella `cliente_documenti` | Alta |
| Solo metadata mock, nessun file reale | Alta |
| Nessun OCR / validazione scadenze automatica | Bassa |
| Nessun versioning documenti | Bassa |

---

## Moduli extra (in app, non nella lista richiesta)

| Modulo | Route | Stato | Note |
|---|---|---|---|
| **WhatsApp** | `/whatsapp` | Parzialmente funzionante | Conversazioni mock, invio simulato, link a scheda cliente |
| **Programmazione** | `/programmazione` | Parzialmente funzionante | Scheduler email/WhatsApp/reminder, create + list mock |

---

## Matrice Supabase vs Mock

| Modulo | Supabase | Mock |
|---|---|---|
| Clienti (CRUD) | ✅ | — |
| Scheda cliente (anagrafica) | ✅ | — |
| Scheda cliente (timeline, doc, questionario, note) | ❌ schema only | ✅ |
| Tour / partecipanti / camere | ❌ no schema | ✅ |
| Pagamenti | ❌ no schema | ✅ |
| Comunicazioni / email / WhatsApp | ❌ schema only | ✅ |
| Notifiche / audit log | ❌ schema only | ✅ |
| Automazioni / schedulazioni | ❌ schema only | ✅ |
| Dashboard / Report / AI / Ricerca | Parziale (clienti) | ✅ maggioranza |
| Impostazioni | ❌ | ✅ stato locale |
| Autenticazione | ❌ | — |
| Preventivi | ❌ | ❌ |
| File upload | ❌ | ❌ |

---

## Roadmap verso Yagiu OS 1.0

Ordine consigliato. Ogni fase abilita la successiva. **Non include funzionalità già presenti** (UI navigabile, CRUD clienti, mock tour/pagamenti, ricerca globale, AI tool engine, ecc.).

---

### Fase 0 — Infrastruttura e deploy (prerequisito)

**Obiettivo:** ambiente production stabile.

1. Correggere `NEXT_PUBLIC_SUPABASE_URL` su Vercel (solo Project URL, senza `/rest/v1/`)
2. Normalizzare URL in `getSupabaseConfig()` come difesa
3. Aggiungere migrazioni Supabase versionate (sostituire deploy manuale di `schema.sql`)
4. CI: `build` + `lint` + `supabase:verify` su ogni PR

**Esito:** deploy affidabile, DB riproducibile.

---

### Fase 1 — Autenticazione e sicurezza (Alta)

**Obiettivo:** app accessibile solo a utenti autorizzati.

1. Supabase Auth: login email/password (o magic link)
2. Route `/login`, middleware protezione `(dashboard)/*`
3. Hook `useUser` / provider sessione
4. RLS per-utente su `clienti` (e tutte le tabelle future)
5. Popolare `created_by` su create cliente
6. Integrare layer `src/tenant/` (ruoli base: admin, operatore)

**Esito:** multi-utente sicuro, base per audit e notifiche reali.

---

### Fase 2 — Dominio Tour su Supabase (Alta)

**Obiettivo:** cuore operativo persistito.

1. Schema: `tours`, `tour_partecipazioni`, `tour_camere`, `tour_camere_assegnazioni`
2. Migrare `tour.service.ts`, `tour-partecipazione.service.ts`, `camera.service.ts` da mock
3. Aggiornare dashboard, viaggi, calendario, ricerca globale per dati reali
4. Completare tab tour: programma, checklist (schema + UI)

**Esito:** tour e rooming sopravvivono al refresh, condivisi tra utenti.

---

### Fase 3 — Pagamenti e Preventivi (Alta)

**Obiettivo:** ciclo commerciale completo.

1. Schema: `pagamenti`, `preventivi`, `preventivo_righe`
2. Modulo Preventivi: route `/preventivi`, CRUD, collegamento tour/cliente
3. Migrare `pagamento.service.ts` su Supabase
4. Tab Pagamenti in scheda cliente (sostituire placeholder)
5. Overview `/pagamenti` con dati reali

**Esito:** flusso preventivo → iscrizione → incasso tracciabile.

---

### Fase 4 — Documenti e File (Alta)

**Obiettivo:** gestione documentale reale.

1. Supabase Storage bucket `documenti`
2. Tabella `cliente_documenti` (metadata + path storage)
3. Upload/download in scheda cliente
4. Tab documenti in scheda tour
5. Route `/documenti` (opzionale) o sezione unificata
6. Alert scadenze → generazione notifiche

**Esito:** passaporti, contratti e assicurazioni gestiti con file reali.

---

### Fase 5 — Profilo viaggiatore completo (Alta)

**Obiettivo:** scheda cliente production-ready.

1. Wire `cliente_questionari` e `cliente_timeline_eventi` su Supabase
2. CRUD questionario da UI
3. Timeline scritta automaticamente su eventi (email, pagamento, iscrizione)
4. Tab Viaggi: storico partecipazioni da `tour_partecipazioni`
5. Note staff persistite

**Esito:** scheda cliente come single source of truth del viaggiatore.

---

### Fase 6 — Comunicazioni reali (Alta)

**Obiettivo:** invii effettivi al cliente.

1. Wire tabelle `comunicazioni`, `email_templates`, `email_invii` su Supabase
2. Integrazione provider email (Resend / SendGrid)
3. Wire `schedulazioni` — collegare `/programmazione` a invii reali
4. WhatsApp Business API (o provider terzo) su `/whatsapp`
5. Wire `whatsapp_conversazioni`, `whatsapp_invii`

**Esito:** email e messaggi tracciati con delivery status.

---

### Fase 7 — Notifiche, Audit, Automazioni (Media)

**Obiettivo:** osservabilità e automazione operativa.

1. Wire `notifiche` — generazione su eventi (scadenza doc, saldo, partenza)
2. Wire `audit_log` — write-through su ogni mutazione CRUD
3. Wire `automazioni` + motore esecuzione (event → action)
4. Collegare toggle impostazioni a preferenze utente su DB

**Esito:** team informato, azioni tracciate, regole che si attivano.

---

### Fase 8 — Report e AI (Media)

**Obiettivo:** insight e assistenza avanzata.

1. Report dedicati con filtri data/tour, grafici trend
2. Export CSV/PDF
3. Collegare LLM provider (OpenAI) al motore tool esistente
4. Persistenza conversazioni AI (opzionale)

**Esito:** decisioni data-driven, assistente conversazionale reale.

---

### Fase 9 — Polish 1.0 (Bassa)

**Obiettivo:** qualità release.

1. Test E2E su flussi critici (auth, CRUD clienti, crea tour, pagamento)
2. Test unitari su servizi e mapper
3. Calendario a griglia (se richiesto)
4. Import/export clienti CSV
5. Documentazione operativa (README, setup, env vars)
6. Monitoring errori (Sentry o equivalente)

**Esito:** Yagiu OS 1.0 — CRM tour operator utilizzabile in produzione dal team.

---

## Riepilogo priorità globale

| Priorità | Aree |
|---|---|
| **Alta** | Auth, Supabase tour/pagamenti/preventivi, documenti/file, comunicazioni reali, profilo viaggiatore, deploy env |
| **Media** | Notifiche/audit/automazioni wired, report avanzati, programmazione reale, impostazioni persistite, calendario |
| **Bassa** | AI LLM, export avanzati, iCal sync, OCR documenti, test E2E estesi |

---

## Stato attuale vs 1.0

```
Oggi (0.1.0)                          1.0 target
─────────────────────────────────     ─────────────────────────────────
✅ UI completa 14+ moduli             ✅ Stessi moduli, dati reali
✅ CRUD clienti Supabase              ✅ + auth + RLS
⚠️  Tutto il resto mock               ✅ Tour, pagamenti, preventivi su DB
❌ Auth assente                       ✅ Login + ruoli
❌ Preventivi assenti                 ✅ Modulo completo
❌ File upload assente                ✅ Storage + documenti
⚠️  Comunicazioni simulate            ✅ Provider reali
⚠️  AI senza LLM                      ✅ LLM + tool layer esistente
```

**Stima effort relativo:** Fase 0–1 (infrastruttura + auth) ≈ 1–2 settimane · Fase 2–5 (domini core) ≈ 4–6 settimane · Fase 6–9 (comunicazioni, polish) ≈ 3–4 settimane.

---

*Documento generato dall'analisi statica del codebase in `/Users/martinomarangella/Projects/yagiu-os`. Per aggiornamenti, rieseguire l'audit dopo ogni milestone.*
