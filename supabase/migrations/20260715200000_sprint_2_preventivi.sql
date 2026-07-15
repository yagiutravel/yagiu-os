-- Sprint 2: Modulo Preventivi production-ready
-- Prerequisito: Sprint 1A/1B migrations + tabella clienti

-- ---------------------------------------------------------------------------
-- Preventivi
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.preventivi (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  numero              TEXT NOT NULL,
  cliente_id          UUID NOT NULL REFERENCES public.clienti (id) ON DELETE RESTRICT,
  tour_id             UUID REFERENCES public.tours (id) ON DELETE SET NULL,
  titolo              TEXT NOT NULL DEFAULT '',
  stato               TEXT NOT NULL DEFAULT 'bozza'
    CHECK (stato IN ('bozza', 'inviato', 'accettato', 'rifiutato', 'scaduto', 'convertito')),
  subtotale_cents     INTEGER NOT NULL DEFAULT 0 CHECK (subtotale_cents >= 0),
  tasse_percentuale   NUMERIC(5, 2) NOT NULL DEFAULT 22.00 CHECK (tasse_percentuale >= 0),
  tasse_cents         INTEGER NOT NULL DEFAULT 0 CHECK (tasse_cents >= 0),
  totale_cents        INTEGER NOT NULL DEFAULT 0 CHECK (totale_cents >= 0),
  valido_fino         DATE,
  note                TEXT NOT NULL DEFAULT '',
  partecipante_id     UUID REFERENCES public.tour_participants (id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_preventivi_organization_id ON public.preventivi (organization_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_cliente_id ON public.preventivi (cliente_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_tour_id ON public.preventivi (tour_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_stato ON public.preventivi (stato);
CREATE INDEX IF NOT EXISTS idx_preventivi_created_at ON public.preventivi (created_at DESC);

DROP TRIGGER IF EXISTS trg_preventivi_updated_at ON public.preventivi;
CREATE TRIGGER trg_preventivi_updated_at
  BEFORE UPDATE ON public.preventivi
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.preventivi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preventivi_select_anon" ON public.preventivi;
DROP POLICY IF EXISTS "preventivi_insert_anon" ON public.preventivi;
DROP POLICY IF EXISTS "preventivi_update_anon" ON public.preventivi;
DROP POLICY IF EXISTS "preventivi_delete_anon" ON public.preventivi;

CREATE POLICY "preventivi_select_anon" ON public.preventivi FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "preventivi_insert_anon" ON public.preventivi FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "preventivi_update_anon" ON public.preventivi FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "preventivi_delete_anon" ON public.preventivi FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Righe preventivo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.preventivo_righe (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  preventivo_id         UUID NOT NULL REFERENCES public.preventivi (id) ON DELETE CASCADE,
  descrizione           TEXT NOT NULL,
  quantita              NUMERIC(12, 2) NOT NULL DEFAULT 1 CHECK (quantita > 0),
  prezzo_unitario_cents INTEGER NOT NULL DEFAULT 0 CHECK (prezzo_unitario_cents >= 0),
  ordine                INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_preventivo_righe_preventivo_id ON public.preventivo_righe (preventivo_id);
CREATE INDEX IF NOT EXISTS idx_preventivo_righe_organization_id ON public.preventivo_righe (organization_id);

DROP TRIGGER IF EXISTS trg_preventivo_righe_updated_at ON public.preventivo_righe;
CREATE TRIGGER trg_preventivo_righe_updated_at
  BEFORE UPDATE ON public.preventivo_righe
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.preventivo_righe ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preventivo_righe_select_anon" ON public.preventivo_righe;
DROP POLICY IF EXISTS "preventivo_righe_insert_anon" ON public.preventivo_righe;
DROP POLICY IF EXISTS "preventivo_righe_update_anon" ON public.preventivo_righe;
DROP POLICY IF EXISTS "preventivo_righe_delete_anon" ON public.preventivo_righe;

CREATE POLICY "preventivo_righe_select_anon" ON public.preventivo_righe FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "preventivo_righe_insert_anon" ON public.preventivo_righe FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "preventivo_righe_update_anon" ON public.preventivo_righe FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "preventivo_righe_delete_anon" ON public.preventivo_righe FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Estensioni audit_log, notifiche, cliente_timeline_eventi
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_log'
  ) THEN
    ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_tipo_check;
    ALTER TABLE public.audit_log
      ADD CONSTRAINT audit_log_tipo_check
      CHECK (tipo IN (
        'cliente', 'pagamento', 'camera', 'tour', 'documento', 'partecipante',
        'comunicazione', 'template_email', 'checklist', 'preventivo', 'generale'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'notifiche'
  ) THEN
    ALTER TABLE public.notifiche DROP CONSTRAINT IF EXISTS notifiche_tipo_check;
    ALTER TABLE public.notifiche
      ADD CONSTRAINT notifiche_tipo_check
      CHECK (tipo IN (
        'saldo_mancante', 'documento_scadenza', 'tour_partenza', 'camera_incompleta',
        'pagamento_ricevuto', 'cliente_nuovo',
        'preventivo_creato', 'preventivo_inviato', 'preventivo_accettato', 'preventivo_convertito'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cliente_timeline_eventi'
  ) THEN
    ALTER TABLE public.cliente_timeline_eventi DROP CONSTRAINT IF EXISTS cliente_timeline_eventi_tipo_check;
    ALTER TABLE public.cliente_timeline_eventi
      ADD CONSTRAINT cliente_timeline_eventi_tipo_check
      CHECK (tipo IN (
        'cliente_creato', 'iscritto_tour', 'pagamento', 'documento_caricato',
        'camera_assegnata', 'email_inviata', 'whatsapp_inviato', 'checklist_completata',
        'tour_concluso',
        'preventivo_creato', 'preventivo_inviato', 'preventivo_accettato', 'preventivo_convertito'
      ));
  END IF;
END $$;

