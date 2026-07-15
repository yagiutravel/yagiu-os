-- Sprint 1A extended: pagamenti, checklist, documenti, timeline + storage bucket
-- Prerequisito: 20260715100000_sprint_1a_tour_core.sql

-- ---------------------------------------------------------------------------
-- Tour payments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id           UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  participant_id    UUID NOT NULL REFERENCES public.tour_participants (id) ON DELETE CASCADE,
  importo_cents     INTEGER NOT NULL CHECK (importo_cents > 0),
  data              DATE NOT NULL,
  metodo            TEXT NOT NULL
    CHECK (metodo IN ('bonifico', 'carta', 'contanti')),
  tipo              TEXT NOT NULL
    CHECK (tipo IN ('acconto', 'saldo')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_payments_tour_id ON public.tour_payments (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_payments_participant_id ON public.tour_payments (participant_id);
CREATE INDEX IF NOT EXISTS idx_tour_payments_organization_id ON public.tour_payments (organization_id);

DROP TRIGGER IF EXISTS trg_tour_payments_updated_at ON public.tour_payments;
CREATE TRIGGER trg_tour_payments_updated_at
  BEFORE UPDATE ON public.tour_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_payments_select_anon" ON public.tour_payments;
DROP POLICY IF EXISTS "tour_payments_insert_anon" ON public.tour_payments;
DROP POLICY IF EXISTS "tour_payments_update_anon" ON public.tour_payments;
DROP POLICY IF EXISTS "tour_payments_delete_anon" ON public.tour_payments;

CREATE POLICY "tour_payments_select_anon" ON public.tour_payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_payments_insert_anon" ON public.tour_payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_payments_update_anon" ON public.tour_payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_payments_delete_anon" ON public.tour_payments FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour checklist (configurabile per tour)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_checklist_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  codice          TEXT NOT NULL,
  etichetta       TEXT NOT NULL,
  descrizione     TEXT NOT NULL DEFAULT '',
  ordine          INTEGER NOT NULL DEFAULT 0,
  obbligatorio    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tour_id, codice)
);

CREATE INDEX IF NOT EXISTS idx_tour_checklist_templates_tour_id ON public.tour_checklist_templates (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_checklist_templates_organization_id ON public.tour_checklist_templates (organization_id);

DROP TRIGGER IF EXISTS trg_tour_checklist_templates_updated_at ON public.tour_checklist_templates;
CREATE TRIGGER trg_tour_checklist_templates_updated_at
  BEFORE UPDATE ON public.tour_checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_checklist_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_checklist_templates_select_anon" ON public.tour_checklist_templates;
DROP POLICY IF EXISTS "tour_checklist_templates_insert_anon" ON public.tour_checklist_templates;
DROP POLICY IF EXISTS "tour_checklist_templates_update_anon" ON public.tour_checklist_templates;
DROP POLICY IF EXISTS "tour_checklist_templates_delete_anon" ON public.tour_checklist_templates;

CREATE POLICY "tour_checklist_templates_select_anon" ON public.tour_checklist_templates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_checklist_templates_insert_anon" ON public.tour_checklist_templates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_checklist_templates_update_anon" ON public.tour_checklist_templates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_checklist_templates_delete_anon" ON public.tour_checklist_templates FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.tour_checklist_completions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  template_id     UUID NOT NULL REFERENCES public.tour_checklist_templates (id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES public.tour_participants (id) ON DELETE CASCADE,
  completato      BOOLEAN NOT NULL DEFAULT false,
  completato_il   TIMESTAMPTZ,
  note            TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_tour_checklist_completions_tour_id ON public.tour_checklist_completions (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_checklist_completions_participant_id ON public.tour_checklist_completions (participant_id);
CREATE INDEX IF NOT EXISTS idx_tour_checklist_completions_organization_id ON public.tour_checklist_completions (organization_id);

DROP TRIGGER IF EXISTS trg_tour_checklist_completions_updated_at ON public.tour_checklist_completions;
CREATE TRIGGER trg_tour_checklist_completions_updated_at
  BEFORE UPDATE ON public.tour_checklist_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_checklist_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_checklist_completions_select_anon" ON public.tour_checklist_completions;
DROP POLICY IF EXISTS "tour_checklist_completions_insert_anon" ON public.tour_checklist_completions;
DROP POLICY IF EXISTS "tour_checklist_completions_update_anon" ON public.tour_checklist_completions;
DROP POLICY IF EXISTS "tour_checklist_completions_delete_anon" ON public.tour_checklist_completions;

CREATE POLICY "tour_checklist_completions_select_anon" ON public.tour_checklist_completions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_checklist_completions_insert_anon" ON public.tour_checklist_completions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_checklist_completions_update_anon" ON public.tour_checklist_completions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_checklist_completions_delete_anon" ON public.tour_checklist_completions FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour documents (metadata; file in storage bucket tour-documents)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  categoria       TEXT NOT NULL DEFAULT 'altro'
    CHECK (categoria IN ('contratto', 'assicurazione', 'programma', 'voucher', 'fattura', 'immagine', 'altro')),
  storage_path    TEXT NOT NULL,
  mime_type       TEXT NOT NULL DEFAULT 'application/octet-stream',
  dimensione_bytes BIGINT NOT NULL DEFAULT 0 CHECK (dimensione_bytes >= 0),
  note            TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_documents_tour_id ON public.tour_documents (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_documents_organization_id ON public.tour_documents (organization_id);

DROP TRIGGER IF EXISTS trg_tour_documents_updated_at ON public.tour_documents;
CREATE TRIGGER trg_tour_documents_updated_at
  BEFORE UPDATE ON public.tour_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tour_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_documents_select_anon" ON public.tour_documents;
DROP POLICY IF EXISTS "tour_documents_insert_anon" ON public.tour_documents;
DROP POLICY IF EXISTS "tour_documents_update_anon" ON public.tour_documents;
DROP POLICY IF EXISTS "tour_documents_delete_anon" ON public.tour_documents;

CREATE POLICY "tour_documents_select_anon" ON public.tour_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_documents_insert_anon" ON public.tour_documents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_documents_update_anon" ON public.tour_documents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tour_documents_delete_anon" ON public.tour_documents FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Tour timeline events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tour_timeline_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  tour_id         UUID NOT NULL REFERENCES public.tours (id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL
    CHECK (tipo IN (
      'prenotazione', 'pagamento', 'documento_caricato', 'tour_completato',
      'email_inviata', 'nota_interna', 'telefonata'
    )),
  titolo          TEXT NOT NULL,
  descrizione     TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_timeline_events_tour_id ON public.tour_timeline_events (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_timeline_events_organization_id ON public.tour_timeline_events (organization_id);
CREATE INDEX IF NOT EXISTS idx_tour_timeline_events_created_at ON public.tour_timeline_events (created_at DESC);

ALTER TABLE public.tour_timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_timeline_events_select_anon" ON public.tour_timeline_events;
DROP POLICY IF EXISTS "tour_timeline_events_insert_anon" ON public.tour_timeline_events;
DROP POLICY IF EXISTS "tour_timeline_events_delete_anon" ON public.tour_timeline_events;

CREATE POLICY "tour_timeline_events_select_anon" ON public.tour_timeline_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tour_timeline_events_insert_anon" ON public.tour_timeline_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tour_timeline_events_delete_anon" ON public.tour_timeline_events FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Storage bucket tour-documents
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('tour-documents', 'tour-documents', true, 52428800)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "tour_documents_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "tour_documents_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "tour_documents_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "tour_documents_storage_delete" ON storage.objects;

CREATE POLICY "tour_documents_storage_select"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'tour-documents');

CREATE POLICY "tour_documents_storage_insert"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'tour-documents');

CREATE POLICY "tour_documents_storage_update"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'tour-documents')
  WITH CHECK (bucket_id = 'tour-documents');

CREATE POLICY "tour_documents_storage_delete"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'tour-documents');
