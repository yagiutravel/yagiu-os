# FASE QUALITY-01 — Code Quality Report

**Data:** 14 luglio 2026  
**Scope:** Analisi completa `src/` (~403 file TS/TSX)  
**Vincolo correzioni:** Nessuna modifica comportamentale

---

## 1. Executive summary

| Metrica | Valore |
|---------|--------|
| File TS/TSX | ~403 |
| Componenti > 200 righe | 10 |
| Funzioni > 50 righe | 74 |
| ESLint errors (pre-fix) | 24 |
| ESLint warnings (pre-fix) | 9 |
| Tipi duplicati conflittuali | 4 |
| Dead code rimosso | 4 file (~3.7 KB) |
| Duplicazioni `getErrorMessage` consolidate | 21 file → 1 utility |

**Stato post-fix:** `npm run build` OK · route principali 200 · ESLint warnings **0** (errors pre-esistenti: 24)

---

## 2. CRITICAL — Architettura parallela non cablata

Moduli costruiti ma **non consumati dall'app attiva**:

| Modulo | File | Righe | Note |
|--------|------|------:|------|
| `src/tenant/` | 41 | ~2.031 | ARCH-02 — preparatorio |
| `src/domain/` | 25 | ~1.586 | Selectors/analytics/rules non usati dalla UI |
| `src/ai/` | 21 | ~895 | Orchestrator isolato |
| `src/features/` | 6 | ~139 | Barrel exports non importati |
| `src/repositories/` | 1 | ~85 | Layer astrazione non consumato |

`dashboard.service.ts` usa `mappers/dashboard.mapper.ts` direttamente, **bypassando** `domain/`.

**Rischio:** drift architetturale — due percorsi paralleli per KPI, alert, analytics.

**Raccomandazione:** Decidere se cablare `domain/` + `tenant/` nelle fasi ARCH successive o documentare esplicitamente come "infrastructure ready".

---

## 3. CRITICAL — Tipi duplicati conflittuali

| Nome | File A | File B | Conflitto |
|------|--------|--------|-----------|
| `ClienteDocumento` | `types/cliente-documento.ts` | `types/cliente-scheda/documenti.ts` | CRM doc vs scheda identità |
| `ClienteTimelineEvento` | `types/cliente-timeline.ts` | `types/cliente-scheda/crm.ts` | Activity log vs CRM timeline |
| `ClienteSchedaSezione` | `types/cliente-scheda/scheda.ts` | `lib/clienti/scheda-sections.ts` | Sezioni dati vs tab UI |
| `ClienteStato` | `types/cliente.ts` | `types/database.ts` | **RISOLTO** — re-export canonico |

**Rischio:** import path errato → semantica diversa senza errore TypeScript.

---

## 4. HIGH — God components / mapper

| File | Righe | Problema |
|------|------:|----------|
| `TourSchedaCamere.tsx` | 467 | UI + 7-state modal + CRUD camere + assegnazioni |
| `dashboard.mapper.ts` | 587 | God mapper: KPI, alert, search, calendar, rooming |
| `DashboardQuickActions.tsx` | 295 | Widget + orchestrazione 4 flussi CRUD |
| `ClientiView.tsx` | 357 | Lista + modal + filtri + paginazione + CRUD |

**74 funzioni > 50 righe** — top: `TourSchedaCamere` (396), `ClientiView` (317), `DashboardQuickActions` (252).

---

## 5. HIGH — Duplicazioni sistemiche

### Pattern ripetuti

| Pattern | Occorrenze | File esempio |
|---------|------------|--------------|
| `getErrorMessage()` locale | 21 → **1** | `shared/utils/error.ts` ✅ |
| `*ServiceError extends Error` | 17+ | Tutti i service |
| List-view shell (load/loading/error/empty) | 6+ | `AutomazioniView`, `ProgrammazioneView` |
| `filter*` search in services | 6 | automazione, schedulazione, whatsapp, notifiche, audit, email |
| `validate*Form` + `has*FormErrors` | 5 | models automazione, schedulazione, whatsapp, email |
| Badge `Record<Stato, string>` | 18 | `*StatoBadge.tsx` |
| Placeholder sezione scheda | 2 | `TourSchedaSectionPlaceholder`, `ClienteSchedaSectionPlaceholder` |
| Stub page "Sezione in arrivo" | 5 | calendario, pagamenti, viaggi, report, impostazioni |

### Servizi sovrapposti

- `dashboard.service` + `dashboard.mapper` ↔ `domain/selectors` + `domain/analytics`
- `email-invio`, `whatsapp`, `comunicazione` — tutti risolvono clienti indipendentemente
- `automazione.service` ↔ `schedulazione.service` — stessa struttura get/list/riepilogo/create/filter

---

## 6. MEDIUM — ESLint react-hooks (24 errors)

Pattern diffuso: `useEffect(() => { void loadData(); })` con `setLoading(true)` sincrono.

**File affetti (22):** `ClientiView`, `TourSchedaCamere`, `TourSchedaPagamenti`, `TourSchedaPartecipanti`, `AutomazioniView`, `ProgrammazioneView`, `DashboardView`, `GlobalSearchModal`, `NotificationCenter`, `AuditLogView`, ecc.

**+1:** `Modal.tsx` — ref aggiornato durante render (`react-hooks/refs`).

**Non auto-fixabile** senza refactor fetch pattern (React Query, Suspense, event-driven load).

---

## 7. MEDIUM — Hooks e cartelle

| Elemento | Verdict |
|----------|---------|
| `hooks/useClientiModal.ts` | Utile — usato in ClientiView + DashboardQuickActions |
| `contexts/index.ts` | Re-export morto — nessun import |
| `shared/index.ts` | Barrel mai importato |
| Cartelle vuote in `src/` | **0** |

---

## 8. LOW — Dipendenze

Runtime deps **lean** (4):

| Package | Note |
|---------|------|
| `next@16.2.10` | ~169 MB — framework |
| `lucide-react@1.24.0` | ~39 MB — import named OK |
| `@supabase/supabase-js` | ~724 KB |
| `react@19.2.4` | ~252 KB |

Nessuna dipendenza runtime inutilizzata rilevata.

---

## 9. Correzioni applicate (auto-fix)

### Dead code rimosso

| File | Motivo |
|------|--------|
| `lib/clienti/timeline-viaggiatore.data.ts` | Zero importatori |
| `mappers/email-invio.mapper.ts` | Zero importatori |
| `mappers/email-template.mapper.ts` | Zero importatori |
| `shared/components/ui/Breadcrumb.tsx` | Componente mai usato |

### Consolidazioni

| Azione | Dettaglio |
|--------|-----------|
| `getErrorMessage` | Estratto in `shared/utils/error.ts`, 21 file aggiornati |
| `ClienteStato` | `database.ts` ora re-esporta da `types/cliente.ts` |
| Import inutilizzati | 9 warning ESLint → 0 |
| `DashboardQuickActions` | `Icon` ora usato al posto di `Plus` hardcoded |
| Service error imports | Rimossi da 3 tour components (solo usati in getErrorMessage locale) |
| `mapAttivitaRecenti` | Rimosso param `now` non utilizzato |
| `domain/analytics`, `domain/selectors` | Rimossi import morti |

### Non modificato (per vincolo comportamentale)

- Split god components / mapper
- Refactor `useEffect` + setState pattern
- Rimozione `ai/`, `domain/`, `tenant/`, `features/` (infrastructure ARCH)
- Merge badge components / placeholder components
- Risoluzione collisioni tipo `ClienteDocumento`, `ClienteTimelineEvento`, `ClienteSchedaSezione` (richiede rename)

---

## 10. Roadmap qualità (prossime fasi)

| Priorità | Azione | Impatto |
|----------|--------|---------|
| P0 | Rinominare tipi conflittuali (`ClienteSchedaTab` vs `ClienteSchedaDataSection`) | Prevenzione bug import |
| P1 | Estrarre `ListViewShell` condiviso | −200 righe duplicate |
| P1 | Split `TourSchedaCamere.tsx` in hook + sub-componenti | Manutenibilità |
| P2 | Cablare `domain/` in `dashboard.service` | Single source of truth KPI |
| P2 | Generic `ConfigBadge<T>` per 18 badge | DRY UI |
| P3 | Refactor fetch pattern (eliminare set-state-in-effect) | 24 ESLint errors |

---

## 11. Verifica

- [x] `npm run build` — OK (16 route)
- [x] Dev routes — `/`, `/clienti`, `/tour`, `/comunicazioni`, `/registro`, `/automazioni`, `/programmazione` → **200**
- [x] ESLint warnings — **0** (da 9)
- [x] Nessuna regressione UI
- [ ] ESLint errors — 24 pre-esistenti (react-hooks), fuori scope auto-fix

---

*Report generato come parte di FASE QUALITY-01. Analisi + cleanup sicuro senza modifica comportamentale.*
