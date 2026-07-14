# FASE ARCH-01 — Software Architecture Refactor Report

**Data:** 14 luglio 2026  
**Obiettivo:** Preparare Yagiu OS per SaaS multi-tenant  
**Vincoli:** Nessuna modifica UI visibile, Supabase, comportamento funzionale

---

## 1. Stato iniziale (pre-refactor)

### Pattern dominante
Architettura **orizzontale a strati**:
```
types → models → mappers → services → mock → components
```

### Metriche
| Metrica | Valore |
|---------|--------|
| File in `src/` | ~354 |
| Domini funzionali | 6+ (clienti, tour, pagamenti, dashboard, marketing, ai) |
| Service con Supabase | 1 (`clienti.service`) |
| Layer `domain/` | Presente ma non consumato dalla UI |
| Modulo `ai/` | Isolato, 21 file, nessuna integrazione UI |

### Problemi rilevati

#### Struttura
- **Clienti frammentato**: types in 10+ file, mappers in 3 posizioni (`mappers/`, `lib/clienti/`, `lib/clienti/scheda/`)
- **Tour senza service**: dati in `lib/tour/*.data.ts`, nessun `tour.service.ts`
- **11 directory vuote** da scaffolding AI incompleto
- **UI, layout, provider** mescolati con feature components in `components/`

#### Duplicazioni / overlap
| Area | Problema |
|------|----------|
| Aggregazione dati | 3 hub paralleli: `dashboard.service`, `global-search.mapper`, `domain/queries` |
| Mapper orfani | `email-invio.mapper.ts`, `email-template.mapper.ts` — zero import |
| Side-effect cross-domain | `email-invio` e `whatsapp` scrivono direttamente in mock comunicazioni/timeline |
| `profilo-ui.ts` in `lib/clienti/` | Usato da 6+ domini non-clienti |

#### Multi-tenant readiness
- Nessun `tenant_id` nel modello dati
- Mock store globali in-memory (non isolati per tenant)
- Repository pattern assente
- Feature boundaries non esplicite

---

## 2. Architettura target

```
src/
├── app/                    # Next.js routes (invariato)
├── components/             # Feature UI (clienti, tour, dashboard, marketing…)
├── features/               # API pubblica per dominio (barrel exports)
├── shared/                 # UI primitives, layout, utils riutilizzabili
├── domain/                 # Read models, selectors, analytics (esistente)
├── repositories/           # Astrazione accesso dati → services
├── services/               # Business logic + data access (invariato)
├── hooks/                  # React hooks
├── providers/              # (deprecato → shared/providers)
├── contexts/               # React contexts cross-cutting
├── types/                  # DTO e view models
├── models/                 # Factories, validation, business rules
├── mappers/                # Entity ↔ view transformations
├── mock/                   # Seed data in-memory
├── utils/                  # (futuro — utils condivise)
├── config/                 # navigation, supabase, env
└── ai/                     # Motore AI isolato
```

### Moduli indipendenti

| Modulo | Entry point | Responsabilità |
|--------|-------------|----------------|
| **Clienti** | `@/features/clienti` | CRM, scheda, documenti, timeline |
| **Tour** | `@/features/tour` | Tour, partecipazioni, camere |
| **Pagamenti** | `@/features/pagamenti` | Pagamenti per tour |
| **Dashboard** | `@/features/dashboard` | KPI, analytics, domain layer |
| **Marketing** | `@/features/marketing` | Comunicazioni, email, WhatsApp, automazioni |
| **AI** | `@/ai` | Orchestrator, tools, memory |
| **Shared** | `@/shared` | UI kit, layout, profilo-ui, config |

---

## 3. Refactoring eseguito

### 3.1 Shared module creato

**Spostato in `src/shared/`:**
| Da | A |
|----|---|
| `components/ui/*` | `shared/components/ui/` |
| `components/layout/*` | `shared/components/layout/` |
| `components/providers/*` | `shared/providers/` |
| `components/search/*` | `shared/components/search/` |
| `components/notifiche/*` | `shared/components/notifiche/` |
| `components/audit-log/*` | `shared/components/audit-log/` |
| `lib/clienti/profilo-ui.ts` | `shared/utils/profilo-ui.ts` |

**Compatibilità:** `tsconfig.json` path aliases mantengono tutti gli import esistenti (`@/components/ui/*` → `shared/components/ui/*`).

### 3.2 Config module creato

| Da | A |
|----|---|
| `lib/navigation.ts` | `config/navigation.ts` |
| `lib/supabase.ts` | `config/supabase.ts` |

Alias: `@/lib/navigation` → `@/config/navigation`, `@/lib/supabase` → `@/config/supabase`.

### 3.3 Feature modules creati

Barrel exports in:
- `features/clienti/index.ts`
- `features/tour/index.ts`
- `features/pagamenti/index.ts`
- `features/dashboard/index.ts`
- `features/marketing/index.ts`

Ogni modulo espone types + services pubblici senza spostare i file interni (zero breaking change).

### 3.4 Repository layer creato

`repositories/index.ts` — re-export dei service esistenti come contratto dati unificato, pronto per:
- Iniezione `tenantId`
- Swap mock → Supabase per dominio
- Test con mock repository

### 3.5 Contexts module

`contexts/index.ts` — re-export `GlobalSearchProvider`.

### 3.6 tsconfig path aliases

Nuovi alias aggiunti:
```json
"@/shared/*", "@/features/*", "@/config/*", "@/repositories/*"
```

### 3.7 Pulizia

- Directory vuote AI scaffolding rimosse dove possibile
- `components/ui`, `layout`, `providers`, `search`, `notifiche`, `audit-log` rimossi (contenuto in shared)

### 3.8 NON modificato (per vincolo)

- UI feature components (`components/clienti`, `tour`, `dashboard`, ecc.)
- `services/`, `types/`, `models/`, `mappers/`, `mock/`
- `supabase/schema.sql`
- Comportamento runtime
- Route `app/`

---

## 4. Dipendenze cross-domain (post-refactor)

```
shared/          ← usato da tutti i domini (UI, layout, profilo-ui)
config/          ← supabase (clienti), navigation (sidebar)
features/*       ← API pubblica, no dipendenze circolari
repositories/    ← wrap services
services/        ← leaf + cross-calls (clienti ← dashboard, tour, AI)
ai/              ← consuma services (futuro: repositories)
domain/          ← isolato, pronto per tenant-scoped snapshots
```

### Accoppiamenti da risolvere in fase successiva
1. `email-invio` / `whatsapp` → scritture dirette mock cross-domain
2. Triple aggregazione dashboard/global-search/domain
3. `lib/clienti/` ancora contiene logica scheda (non in features/clienti fisicamente)

---

## 5. Roadmap multi-tenant (prossime fasi)

| Fase | Azione |
|------|--------|
| ARCH-02 | `TenantContext` + `tenantId` in repositories |
| ARCH-03 | Vertical slice: spostare `services/clienti/*` in `features/clienti/` |
| ARCH-04 | `tour.service.ts` + repository tour con tenant scope |
| ARCH-05 | Consolidare aggregazione in `domain/queries` |
| ARCH-06 | Mock store per-tenant |
| ARCH-07 | Wire `ai/` orchestrator con `TenantContext` |

---

## 6. Verifica

- [x] `npm run build` — OK (16 route, TypeScript pulito)
- [x] `npm run dev` — home, clienti, tour, comunicazioni, registro **200**
- [x] Nessuna regressione UI
- [x] Import legacy `@/components/ui/*` funzionanti via alias tsconfig

---

## 7. Naming conventions (raccomandate)

| Layer | Pattern | Esempio |
|-------|---------|---------|
| Types | `*.ts` o `domain/` | `cliente.ts` |
| Models | `models/<domain>.ts` | `pagamento.ts` |
| Services | `*.service.ts` | `clienti.service.ts` |
| Mappers | `*.mapper.ts` | `tour-partecipazione.mapper.ts` |
| Features | `features/<domain>/index.ts` | barrel export |
| Shared UI | `shared/components/ui/` | `Button.tsx` |
| Config | `config/` | `navigation.ts` |

---

*Report generato come parte di FASE ARCH-01. Refactoring strutturale senza modifica comportamentale.*
