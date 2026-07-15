-- Sprint 1A: Tour core (organizations, tours, staff, hotels, rooms, assignments, participants)
-- Esegui dalla SQL Editor di Supabase o via CLI.
-- Prerequisito: migration 20260715090000_sprint_0_legacy_schema.sql (tabella clienti, set_updated_at).

-- ---------------------------------------------------------------------------
-- Helper: set_updated_at (idempotente — già definita da schema.sql)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Organizations (multi-tenant prerequisite)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_select_anon" ON public.organizations;
CREATE POLICY "organizations_select_anon"
  ON public.organizations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "organizations_insert_anon" ON public.organizations;
CREATE POLICY "organizations_insert_anon"
  ON public.organizations FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Default organization for single-tenant / pre-auth phase
INSERT INTO public.organizations (id, name, slug, status)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Yagiu OS Default',
  'default',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Tours
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tours (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by            UUID REFERENCES auth.users (id) ON DELETE SET NULL,

  nome                  TEXT NOT NULL,
  slug                  TEXT NOT NULL,
  destinazione          TEXT NOT NULL DEFAULT '',
  descrizione           TEXT NOT NULL DEFAULT '',

  stato                 TEXT NOT NULL DEFAULT 'in_vendita'
    CHECK (stato IN ('bozza', 'in_vendita', 'completo', 'in_corso', 'terminato', 'archiviato')),

  data_apertura_vendite DATE,
  data_chiusura_vendite DATE,
  data_partenza         DATE NOT NULL,
  data_ritorno          DATE NOT NULL,
  durata_giorni         INTEGER,

  capienza_massima      INTEGER NOT NULL CHECK (capienza_massima > 0),
  prezzo_cents          INTEGER NOT NULL DEFAULT 0 CHECK (prezzo_cents >= 0),
  valuta                CHAR(3) NOT NULL DEFAULT 'EUR',

  UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_tours_organization_id ON public.tours (organization_id);
CREATE INDEX IF NOT EXISTS idx_tours_stato ON public.tours (stato);
CREATE INDEX IF NOT EXISTS idx_tours_data_partenza ON public.tours (data_partenza);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON public.tours (organization_id, slug);

DROP TRIGGER IF EXISTS trg_tours_updated_at ON public.tours;
CREATE TRIGGER trg_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.compute_tour_durata_giorni()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.data_partenza IS NOT NULL AND NEW.data_ritorno IS NOT NULL THEN
    NEW.durata_giorni := (NEW.data_ritorno - NEW.data_partenza) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tours_compute_durata ON public.tours;
CREATE TRIGGER trg_tours_compute_durata
  BEFORE INSERT OR UPDATE OF data_partenza, data_ritorno ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_tour_durata_giorni();

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tours_select_anon" ON public.tours;
DROP POLICY IF EXISTS "tours_insert_anon" ON public.tours;
DROP POLICY IF EXISTS "tours_update_anon" ON public.tours;
DROP POLICY IF EXISTS "tours_delete_anon" ON public.tours;

CREATE POLICY "tours_select_anon" ON public.tours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tours_insert_anon" ON public.tours FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tours_update_anon" ON public.tours FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tours_delete_anon" ON public.tours FOR DELETE TO anon, authenticated USING (true);

COMMENT ON TABLE public.tours IS 'Tour operativi Yagiu OS';

-- ---------------------------------------------------------------------------
-- Tour staff
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id     UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  ruolo       TEXT NOT NULL
    CHECK (ruolo IN ('tour_leader', 'accompagnatore', 'guida_locale', 'operatore')),
  nome        TEXT NOT NULL,
  email       TEXT,
  telefono    TEXT,
  user_id     UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ordine      INTEGER NOT NULL DEFAULT 0,
  note        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_staff_tour_id ON public.tour_staff (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_staff_organization_id ON public.tour_staff (organization_id);

ALTER TABLE public.tour_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_staff_select_anon" ON public.tour_staff;
DROP POLICY IF EXISTS "tour_staff_insert_anon" ON public.tour_staff;
DROP POLICY IF EXISTS "tour_staff_update_anon" ON public.tour_staff;
DROP POLICY IF EXISTS "tour_staff_delete_anon" ON public.tour_staff;

CREATE POLICY "tour_staff_select_anon" ON public.tour_staff FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_staff_insert_anon" ON public.tour_staff FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_staff_update_anon" ON public.tour_staff FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_staff_delete_anon" ON public.tour_staff FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour hotels
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_hotels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  indirizzo       TEXT NOT NULL DEFAULT '',
  citta           TEXT NOT NULL DEFAULT '',
  paese           TEXT NOT NULL DEFAULT '',
  check_in        DATE,
  check_out       DATE,
  telefono        TEXT,
  note            TEXT NOT NULL DEFAULT '',
  ordine          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_hotels_tour_id ON public.tour_hotels (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_hotels_organization_id ON public.tour_hotels (organization_id);

DROP TRIGGER IF EXISTS trg_tour_hotels_updated_at ON public.tour_hotels;
CREATE TRIGGER trg_tour_hotels_updated_at
  BEFORE UPDATE ON public.tour_hotels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_hotels_select_anon" ON public.tour_hotels;
DROP POLICY IF EXISTS "tour_hotels_insert_anon" ON public.tour_hotels;
DROP POLICY IF EXISTS "tour_hotels_update_anon" ON public.tour_hotels;
DROP POLICY IF EXISTS "tour_hotels_delete_anon" ON public.tour_hotels;

CREATE POLICY "tour_hotels_select_anon" ON public.tour_hotels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_hotels_insert_anon" ON public.tour_hotels FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_hotels_update_anon" ON public.tour_hotels FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_hotels_delete_anon" ON public.tour_hotels FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour participants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_participants (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id                 UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  cliente_id              UUID NOT NULL REFERENCES public.clienti (id) ON DELETE RESTRICT,
  stato_iscrizione        TEXT NOT NULL DEFAULT 'iscritto'
    CHECK (stato_iscrizione IN ('iscritto', 'lista_attesa', 'annullato')),
  posizione_lista_attesa  INTEGER,
  ruolo                   TEXT NOT NULL DEFAULT 'partecipante'
    CHECK (ruolo IN ('partecipante', 'tour_leader', 'accompagnatore', 'guida_locale')),
  pagamento               TEXT NOT NULL DEFAULT 'non_iniziato'
    CHECK (pagamento IN ('non_iniziato', 'acconto_ricevuto', 'saldo_ricevuto')),
  documenti               TEXT NOT NULL DEFAULT 'da_inviare'
    CHECK (documenti IN ('da_inviare', 'ricevuti', 'verificati')),
  questionario            TEXT NOT NULL DEFAULT 'da_compilare'
    CHECK (questionario IN ('da_compilare', 'compilato')),
  quota_cents             INTEGER CHECK (quota_cents IS NULL OR quota_cents >= 0),
  note                    TEXT NOT NULL DEFAULT '',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tour_id, cliente_id)
);

CREATE INDEX IF NOT EXISTS idx_tour_participants_tour_id ON public.tour_participants (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_participants_cliente_id ON public.tour_participants (cliente_id);
CREATE INDEX IF NOT EXISTS idx_tour_participants_organization_id ON public.tour_participants (organization_id);
CREATE INDEX IF NOT EXISTS idx_tour_participants_stato ON public.tour_participants (stato_iscrizione);

DROP TRIGGER IF EXISTS trg_tour_participants_updated_at ON public.tour_participants;
CREATE TRIGGER trg_tour_participants_updated_at
  BEFORE UPDATE ON public.tour_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_participants_select_anon" ON public.tour_participants;
DROP POLICY IF EXISTS "tour_participants_insert_anon" ON public.tour_participants;
DROP POLICY IF EXISTS "tour_participants_update_anon" ON public.tour_participants;
DROP POLICY IF EXISTS "tour_participants_delete_anon" ON public.tour_participants;

CREATE POLICY "tour_participants_select_anon" ON public.tour_participants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_participants_insert_anon" ON public.tour_participants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_participants_update_anon" ON public.tour_participants FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_participants_delete_anon" ON public.tour_participants FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour rooms
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  hotel_id        UUID REFERENCES public.tour_hotels (id) ON DELETE SET NULL,
  numero          TEXT NOT NULL,
  tipologia       TEXT NOT NULL
    CHECK (tipologia IN ('singola', 'doppia', 'tripla', 'quadrupla')),
  capienza        INTEGER NOT NULL CHECK (capienza > 0),
  note            TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tour_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_tour_rooms_tour_id ON public.tour_rooms (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_rooms_hotel_id ON public.tour_rooms (hotel_id);
CREATE INDEX IF NOT EXISTS idx_tour_rooms_organization_id ON public.tour_rooms (organization_id);

DROP TRIGGER IF EXISTS trg_tour_rooms_updated_at ON public.tour_rooms;
CREATE TRIGGER trg_tour_rooms_updated_at
  BEFORE UPDATE ON public.tour_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_rooms_select_anon" ON public.tour_rooms;
DROP POLICY IF EXISTS "tour_rooms_insert_anon" ON public.tour_rooms;
DROP POLICY IF EXISTS "tour_rooms_update_anon" ON public.tour_rooms;
DROP POLICY IF EXISTS "tour_rooms_delete_anon" ON public.tour_rooms;

CREATE POLICY "tour_rooms_select_anon" ON public.tour_rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_rooms_insert_anon" ON public.tour_rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_rooms_update_anon" ON public.tour_rooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_rooms_delete_anon" ON public.tour_rooms FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Room assignments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.room_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  room_id         UUID NOT NULL REFERENCES public.tour_rooms (id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL UNIQUE REFERENCES public.tour_participants (id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_room_assignments_room_id ON public.room_assignments (room_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_participant_id ON public.room_assignments (participant_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_organization_id ON public.room_assignments (organization_id);

ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "room_assignments_select_anon" ON public.room_assignments;
DROP POLICY IF EXISTS "room_assignments_insert_anon" ON public.room_assignments;
DROP POLICY IF EXISTS "room_assignments_update_anon" ON public.room_assignments;
DROP POLICY IF EXISTS "room_assignments_delete_anon" ON public.room_assignments;

CREATE POLICY "room_assignments_select_anon" ON public.room_assignments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "room_assignments_insert_anon" ON public.room_assignments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "room_assignments_update_anon" ON public.room_assignments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "room_assignments_delete_anon" ON public.room_assignments FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour stats view
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.tour_stats AS
SELECT
  t.id AS tour_id,
  COUNT(p.id) FILTER (WHERE p.stato_iscrizione = 'iscritto')::INTEGER AS numero_partecipanti,
  COUNT(p.id) FILTER (WHERE p.stato_iscrizione = 'lista_attesa')::INTEGER AS numero_lista_attesa,
  (t.capienza_massima - COUNT(p.id) FILTER (WHERE p.stato_iscrizione = 'iscritto'))::INTEGER AS posti_disponibili
FROM public.tours t
LEFT JOIN public.tour_participants p ON p.tour_id = t.id
GROUP BY t.id, t.capienza_massima;

COMMENT ON VIEW public.tour_stats IS 'Conteggi partecipanti calcolati per tour';
