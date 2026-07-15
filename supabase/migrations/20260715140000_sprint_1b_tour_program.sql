-- Sprint 1B: Programma itinerario, voli, transfer, assicurazioni
-- Prerequisito: 20260715100000_sprint_1a_tour_core.sql + 20260715120000_sprint_1a_tour_extended.sql

-- ---------------------------------------------------------------------------
-- Tour program days (giorni itinerario)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_program_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  giorno_numero   INTEGER NOT NULL CHECK (giorno_numero > 0),
  data            DATE,
  titolo          TEXT NOT NULL DEFAULT '',
  descrizione     TEXT NOT NULL DEFAULT '',
  hotel_id        UUID REFERENCES public.tour_hotels (id) ON DELETE SET NULL,
  ordine          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tour_id, giorno_numero)
);

CREATE INDEX IF NOT EXISTS idx_tour_program_days_tour_id ON public.tour_program_days (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_program_days_hotel_id ON public.tour_program_days (hotel_id);
CREATE INDEX IF NOT EXISTS idx_tour_program_days_organization_id ON public.tour_program_days (organization_id);

DROP TRIGGER IF EXISTS trg_tour_program_days_updated_at ON public.tour_program_days;
CREATE TRIGGER trg_tour_program_days_updated_at
  BEFORE UPDATE ON public.tour_program_days
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_program_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_program_days_select_anon" ON public.tour_program_days;
DROP POLICY IF EXISTS "tour_program_days_insert_anon" ON public.tour_program_days;
DROP POLICY IF EXISTS "tour_program_days_update_anon" ON public.tour_program_days;
DROP POLICY IF EXISTS "tour_program_days_delete_anon" ON public.tour_program_days;

CREATE POLICY "tour_program_days_select_anon" ON public.tour_program_days FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_program_days_insert_anon" ON public.tour_program_days FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_program_days_update_anon" ON public.tour_program_days FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_program_days_delete_anon" ON public.tour_program_days FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour program activities (attività giornaliere)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_program_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  day_id          UUID NOT NULL REFERENCES public.tour_program_days (id) ON DELETE CASCADE,
  titolo          TEXT NOT NULL,
  descrizione     TEXT NOT NULL DEFAULT '',
  ora_inizio      TIME,
  ora_fine        TIME,
  luogo           TEXT NOT NULL DEFAULT '',
  tipo            TEXT NOT NULL DEFAULT 'visita'
    CHECK (tipo IN ('visita', 'pasto', 'trasferimento', 'libero', 'altro')),
  ordine          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_program_activities_day_id ON public.tour_program_activities (day_id);
CREATE INDEX IF NOT EXISTS idx_tour_program_activities_tour_id ON public.tour_program_activities (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_program_activities_organization_id ON public.tour_program_activities (organization_id);

DROP TRIGGER IF EXISTS trg_tour_program_activities_updated_at ON public.tour_program_activities;
CREATE TRIGGER trg_tour_program_activities_updated_at
  BEFORE UPDATE ON public.tour_program_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_program_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_program_activities_select_anon" ON public.tour_program_activities;
DROP POLICY IF EXISTS "tour_program_activities_insert_anon" ON public.tour_program_activities;
DROP POLICY IF EXISTS "tour_program_activities_update_anon" ON public.tour_program_activities;
DROP POLICY IF EXISTS "tour_program_activities_delete_anon" ON public.tour_program_activities;

CREATE POLICY "tour_program_activities_select_anon" ON public.tour_program_activities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_program_activities_insert_anon" ON public.tour_program_activities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_program_activities_update_anon" ON public.tour_program_activities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_program_activities_delete_anon" ON public.tour_program_activities FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour flights (voli)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_flights (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id           UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  day_id            UUID REFERENCES public.tour_program_days (id) ON DELETE SET NULL,
  direzione         TEXT NOT NULL DEFAULT 'andata'
    CHECK (direzione IN ('andata', 'ritorno', 'interno')),
  compagnia         TEXT NOT NULL DEFAULT '',
  numero_volo       TEXT NOT NULL,
  aeroporto_partenza TEXT NOT NULL DEFAULT '',
  aeroporto_arrivo  TEXT NOT NULL DEFAULT '',
  data_partenza     DATE NOT NULL,
  ora_partenza      TIME,
  data_arrivo       DATE,
  ora_arrivo        TIME,
  note              TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_flights_tour_id ON public.tour_flights (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_flights_day_id ON public.tour_flights (day_id);
CREATE INDEX IF NOT EXISTS idx_tour_flights_organization_id ON public.tour_flights (organization_id);

DROP TRIGGER IF EXISTS trg_tour_flights_updated_at ON public.tour_flights;
CREATE TRIGGER trg_tour_flights_updated_at
  BEFORE UPDATE ON public.tour_flights
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_flights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_flights_select_anon" ON public.tour_flights;
DROP POLICY IF EXISTS "tour_flights_insert_anon" ON public.tour_flights;
DROP POLICY IF EXISTS "tour_flights_update_anon" ON public.tour_flights;
DROP POLICY IF EXISTS "tour_flights_delete_anon" ON public.tour_flights;

CREATE POLICY "tour_flights_select_anon" ON public.tour_flights FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_flights_insert_anon" ON public.tour_flights FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_flights_update_anon" ON public.tour_flights FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_flights_delete_anon" ON public.tour_flights FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour transfers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  day_id          UUID REFERENCES public.tour_program_days (id) ON DELETE SET NULL,
  tipo            TEXT NOT NULL DEFAULT 'bus'
    CHECK (tipo IN ('bus', 'van', 'treno', 'barca', 'privato', 'altro')),
  partenza        TEXT NOT NULL,
  destinazione    TEXT NOT NULL,
  data            DATE NOT NULL,
  ora             TIME,
  fornitore       TEXT NOT NULL DEFAULT '',
  note            TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_transfers_tour_id ON public.tour_transfers (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_transfers_day_id ON public.tour_transfers (day_id);
CREATE INDEX IF NOT EXISTS idx_tour_transfers_organization_id ON public.tour_transfers (organization_id);

DROP TRIGGER IF EXISTS trg_tour_transfers_updated_at ON public.tour_transfers;
CREATE TRIGGER trg_tour_transfers_updated_at
  BEFORE UPDATE ON public.tour_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_transfers_select_anon" ON public.tour_transfers;
DROP POLICY IF EXISTS "tour_transfers_insert_anon" ON public.tour_transfers;
DROP POLICY IF EXISTS "tour_transfers_update_anon" ON public.tour_transfers;
DROP POLICY IF EXISTS "tour_transfers_delete_anon" ON public.tour_transfers;

CREATE POLICY "tour_transfers_select_anon" ON public.tour_transfers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_transfers_insert_anon" ON public.tour_transfers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_transfers_update_anon" ON public.tour_transfers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_transfers_delete_anon" ON public.tour_transfers FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour insurances (assicurazioni)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_insurances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  fornitore       TEXT NOT NULL,
  polizza_numero  TEXT NOT NULL DEFAULT '',
  copertura       TEXT NOT NULL DEFAULT '',
  premio_cents    INTEGER NOT NULL DEFAULT 0 CHECK (premio_cents >= 0),
  data_inizio     DATE,
  data_fine       DATE,
  stato           TEXT NOT NULL DEFAULT 'da_emettere'
    CHECK (stato IN ('da_emettere', 'attiva', 'scaduta', 'annullata')),
  note            TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_insurances_tour_id ON public.tour_insurances (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_insurances_organization_id ON public.tour_insurances (organization_id);

DROP TRIGGER IF EXISTS trg_tour_insurances_updated_at ON public.tour_insurances;
CREATE TRIGGER trg_tour_insurances_updated_at
  BEFORE UPDATE ON public.tour_insurances
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_insurances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_insurances_select_anon" ON public.tour_insurances;
DROP POLICY IF EXISTS "tour_insurances_insert_anon" ON public.tour_insurances;
DROP POLICY IF EXISTS "tour_insurances_update_anon" ON public.tour_insurances;
DROP POLICY IF EXISTS "tour_insurances_delete_anon" ON public.tour_insurances;

CREATE POLICY "tour_insurances_select_anon" ON public.tour_insurances FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_insurances_insert_anon" ON public.tour_insurances FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_insurances_update_anon" ON public.tour_insurances FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_insurances_delete_anon" ON public.tour_insurances FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Extend tour_timeline_events types for Sprint 1B
-- ---------------------------------------------------------------------------
ALTER TABLE public.tour_timeline_events
  DROP CONSTRAINT IF EXISTS tour_timeline_events_tipo_check;

ALTER TABLE public.tour_timeline_events
  ADD CONSTRAINT tour_timeline_events_tipo_check
  CHECK (tipo IN (
    'prenotazione', 'pagamento', 'documento_caricato', 'tour_completato',
    'email_inviata', 'nota_interna', 'telefonata',
    'programma_giorno', 'attivita', 'volo', 'transfer', 'assicurazione'
  ));
