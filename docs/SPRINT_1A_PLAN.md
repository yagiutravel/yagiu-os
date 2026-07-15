# Sprint 1A — Tour Core su Supabase

**Obiettivo:** persistere il cuore operativo Tour (anagrafica, staff, hotel, camere, assegnazioni, partecipanti) su Supabase, mantenendo UI e route esistenti funzionanti e deployabili.

**Fuori scope 1A:** checklist, documenti, timeline, voli, transfer, assicurazioni, pagamenti DB, programma, immagini.

---

## 1. Tabelle (7 + 1 prerequisito)

| # | Tabella | Ruolo |
|---|---|---|
| 0 | `organizations` | Multi-tenant SaaS (seed default) |
| 1 | `tours` | Anagrafica tour |
| 2 | `tour_staff` | Staff (tour leader, accompagnatore, guide, operatori) |
| 3 | `tour_hotels` | Soggiorni hotel per tour |
| 4 | `tour_rooms` | Camere (FK → hotel opzionale) |
| 5 | `room_assignments` | Assegnazione partecipante → camera |
| 6 | `tour_participants` | Iscrizioni (FK → tours, clienti) |

**Vista:** `tour_stats` — conteggi partecipanti iscritti / lista attesa / posti disponibili.

---

## 2. Mapping DB ↔ dominio applicativo

### Tour `stato`

| DB | UI (`TourStato`) |
|---|---|
| `bozza` | `Bozza` *(nuovo, opzionale in form)* |
| `in_vendita` | `In vendita` |
| `completo` | `Completo` |
| `in_corso` | `In corso` |
| `terminato` | `Terminato` |
| `archiviato` | `Archiviato` |

### Participant `stato_iscrizione`

| DB | UI |
|---|---|
| `iscritto` | `Iscritto` |
| `lista_attesa` | `Lista attesa` |
| `annullato` | `Annullato` |

### Room `tipologia`

| DB | UI (`TipologiaCamera`) |
|---|---|
| `singola` | `Singola` |
| `doppia` | `Doppia` |
| `tripla` | `Tripla` |
| `quadrupla` | `Quadrupla` |

### Prezzo

- DB: `prezzo_cents INTEGER` + `valuta CHAR(3)`
- UI: stringa `€ 3.200` — parse/format in `lib/tour/price.ts`

### `numeroPartecipanti`

- **Non colonna** su `tours` — calcolato da `tour_stats` o COUNT al read.

### `tourLeader`

- **Non colonna** su `tours` — prima riga `tour_staff` con `ruolo = 'tour_leader'`, oppure creata dal form alla creazione tour.

---

## 3. File da creare

| File | Scopo |
|---|---|
| `supabase/migrations/20260715100000_sprint_1a_tour_core.sql` | DDL + seed organization |
| `src/config/organization.ts` | Risoluzione `organization_id` |
| `src/lib/tour/db-enums.ts` | Mapping enum DB ↔ UI |
| `src/lib/tour/slug.ts` | Generazione slug univoco |
| `src/lib/tour/price.ts` | Parse/format prezzo |
| `src/mappers/tour.mapper.ts` | Row → `Tour`, insert/update payloads |
| `src/mappers/tour-hotel.mapper.ts` | Row → `TourHotel` |
| `src/mappers/tour-participant.mapper.ts` | Row → `PartecipazioneTour` |
| `src/mappers/tour-room.mapper.ts` | Row → `Camera`, assegnazioni |
| `src/types/tour-hotel.ts` | Tipi hotel |
| `src/services/tour-hotel.service.ts` | CRUD hotel |
| `src/components/tour/TourHotelSection.tsx` | UI hotel in tab Camere |
| `src/components/tour/TourHotelModal.tsx` | Modale hotel |

---

## 4. File da riscrivere

| File | Cambiamento |
|---|---|
| `src/services/tour.service.ts` | Supabase CRUD + cache sync per `getTourSync` |
| `src/services/tour-partecipazione.service.ts` | `tour_participants` |
| `src/services/camera.service.ts` | `tour_rooms` + `room_assignments` |
| `src/types/database.ts` | Tipi tabelle 1A |
| `src/types/camera.ts` | `hotelId`, `hotelNome` opzionali su `Camera` |
| `src/types/tour-partecipazione.ts` | `statoIscrizione` |
| `src/types/tour.ts` | Nessun breaking change UI |

---

## 5. File da aggiornare (rimozione dipendenze mock)

| File | Cambiamento |
|---|---|
| `src/services/dashboard.service.ts` | Rimuove `seedPartecipazioniMock` / `seedCamereMock` |
| `src/mappers/global-search.mapper.ts` | `await getTours()`, no seed tour mock |
| `src/mappers/tour-partecipazione.mapper.ts` | `getTourByClienteId` async con batch tour |
| `src/domain/snapshot/loader.ts` | Carica partecipanti/camere da servizi reali |
| `scripts/verify-supabase.mjs` | Verifica tabelle 1A |
| `.env.local.example` | `NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID` |

**Mock da non usare più nel flusso tour:** `mock/tours.ts`, `tour-partecipazioni.ts`, `camere.ts` — restano nel repo ma non importati dai servizi 1A.

**Pagamenti:** restano mock in 1A (`pagamento.service.ts` invariato).

---

## 6. Flussi operativi

### Creazione tour

1. Validazione form esistente (`models/tour.ts`)
2. Genera `slug` da `nome`
3. `INSERT tours` con `organization_id`, `prezzo_cents`
4. `INSERT tour_staff` (tour_leader dal form)
5. Invalida cache dashboard + global search
6. Redirect a scheda (comportamento attuale)

### Iscrizione partecipante

1. Verifica UNIQUE `(tour_id, cliente_id)`
2. `INSERT tour_participants` con `stato_iscrizione = 'iscritto'`
3. Campi legacy UI (`pagamento`, `documenti`, `questionario`) salvati come colonne fino a sprint checklist

### Assegnazione camera

1. Verifica capienza (logica esistente `canAssignToCamera`)
2. `INSERT room_assignments` — UNIQUE su `participant_id`
3. Move = DELETE + INSERT

### Hotel → Camera

1. CRUD `tour_hotels` nella tab Camere (sezione sopra rooming)
2. Creazione camera con `hotel_id` opzionale

---

## 7. Organization context (pre-auth)

```text
NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID=<uuid seed migration>
```

Fallback: `SELECT id FROM organizations ORDER BY created_at LIMIT 1`.

Tutte le query tour filtrano per `organization_id`.

---

## 8. Criteri di accettazione

- [ ] `npm run build` senza errori
- [ ] `npm run supabase:verify` verifica `tours` e tabelle correlate
- [ ] CRUD tour persiste dopo refresh
- [ ] Partecipanti collegati a `clienti` Supabase
- [ ] Hotel + camere + assegnazioni persistono
- [ ] Dashboard e ricerca globale mostrano tour reali
- [ ] Pagamenti tab ancora funzionante (mock)
- [ ] Nessuna nuova voce di menu
- [ ] Design invariato salvo sezione hotel in tab Camere

---

## 9. Ordine implementazione

1. Migration SQL
2. Tipi `database.ts` + enum mapper
3. `organization.ts` + mapper tour
4. `tour.service.ts`
5. `tour-partecipazione.service.ts`
6. `tour-hotel.service.ts` + `camera.service.ts`
7. Aggiornamento consumer (dashboard, search, loader, mapper cliente)
8. UI hotel (minima)
9. Build + verify

---

## 10. Sprint successivi (riferimento)

| Sprint | Tabelle |
|---|---|
| 1B | `tour_pagamenti` |
| 1C | `tour_checklist_templates`, `tour_checklist_items` |
| 1D | `tour_documenti` + Storage |
| 1E | `tour_timeline_eventi` |
| 1F | `tour_voli`, `tour_transfer`, `tour_assicurazioni` |
