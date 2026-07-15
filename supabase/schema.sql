-- Yagiu OS — Schema Supabase (riferimento)
-- Le tabelle sono applicate da: supabase/migrations/20260715090000_sprint_0_legacy_schema.sql
-- Non eseguire manualmente se le migration numerate sono già state applicate.

-- ---------------------------------------------------------------------------
-- Tabella clienti
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clienti (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  nome          TEXT NOT NULL,
  cognome       TEXT,
  email         TEXT,
  telefono      TEXT,
  azienda       TEXT,

  stato         TEXT,

  data_nascita  DATE,

  indirizzo     TEXT,
  citta         TEXT,
  provincia     TEXT,
  cap           TEXT,
  paese         TEXT,

  note          TEXT,

  created_by    UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Indici
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clienti_email
  ON public.clienti (email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clienti_telefono
  ON public.clienti (telefono)
  WHERE telefono IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clienti_stato
  ON public.clienti (stato)
  WHERE stato IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clienti_updated_at ON public.clienti;

CREATE TRIGGER trg_clienti_updated_at
  BEFORE UPDATE ON public.clienti
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.clienti ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clienti_select_anon" ON public.clienti;
DROP POLICY IF EXISTS "clienti_insert_anon" ON public.clienti;
DROP POLICY IF EXISTS "clienti_update_anon" ON public.clienti;
DROP POLICY IF EXISTS "clienti_delete_anon" ON public.clienti;

CREATE POLICY "clienti_select_anon"
  ON public.clienti FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "clienti_insert_anon"
  ON public.clienti FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "clienti_update_anon"
  ON public.clienti FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "clienti_delete_anon"
  ON public.clienti FOR DELETE
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Commenti
-- ---------------------------------------------------------------------------
COMMENT ON TABLE public.clienti IS 'Anagrafica clienti Yagiu OS';
COMMENT ON COLUMN public.clienti.stato IS 'Es. Attivo, Inattivo, Prospect';
COMMENT ON COLUMN public.clienti.created_by IS 'Utente Supabase Auth che ha creato il record';

-- ---------------------------------------------------------------------------
-- Tabella cliente_questionari (1:1 con clienti)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cliente_questionari (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id          UUID NOT NULL UNIQUE REFERENCES public.clienti (id) ON DELETE CASCADE,
  creato_il           TIMESTAMPTZ NOT NULL DEFAULT now(),
  aggiornato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),

  allergie            TEXT NOT NULL DEFAULT '',
  intolleranze        TEXT NOT NULL DEFAULT '',
  farmaci             TEXT NOT NULL DEFAULT '',
  contatto_emergenza  TEXT NOT NULL DEFAULT '',
  numero_emergenza    TEXT NOT NULL DEFAULT '',
  taglia_maglietta    TEXT NOT NULL DEFAULT '',
  taglia_felpa        TEXT NOT NULL DEFAULT '',
  camera_preferita    TEXT NOT NULL DEFAULT '',
  compagno_richiesto  TEXT NOT NULL DEFAULT '',
  note_alimentari     TEXT NOT NULL DEFAULT '',

  vegetariano         BOOLEAN NOT NULL DEFAULT false,
  vegano              BOOLEAN NOT NULL DEFAULT false,
  celiaco             BOOLEAN NOT NULL DEFAULT false,
  fumatore            BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_cliente_questionari_cliente_id
  ON public.cliente_questionari (cliente_id);

DROP TRIGGER IF EXISTS trg_cliente_questionari_updated_at ON public.cliente_questionari;

CREATE OR REPLACE FUNCTION public.set_aggiornato_il()
RETURNS TRIGGER AS $$
BEGIN
  NEW.aggiornato_il = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cliente_questionari_updated_at
  BEFORE UPDATE ON public.cliente_questionari
  FOR EACH ROW
  EXECUTE FUNCTION public.set_aggiornato_il();

ALTER TABLE public.cliente_questionari ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cliente_questionari_select_anon" ON public.cliente_questionari;
DROP POLICY IF EXISTS "cliente_questionari_insert_anon" ON public.cliente_questionari;
DROP POLICY IF EXISTS "cliente_questionari_update_anon" ON public.cliente_questionari;
DROP POLICY IF EXISTS "cliente_questionari_delete_anon" ON public.cliente_questionari;

CREATE POLICY "cliente_questionari_select_anon"
  ON public.cliente_questionari FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "cliente_questionari_insert_anon"
  ON public.cliente_questionari FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "cliente_questionari_update_anon"
  ON public.cliente_questionari FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cliente_questionari_delete_anon"
  ON public.cliente_questionari FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.cliente_questionari IS 'Questionario viaggiatore — salute, alimentazione e logistica';

-- ---------------------------------------------------------------------------
-- Tabella comunicazioni
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comunicazioni (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES public.clienti (id) ON DELETE CASCADE,
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),
  aggiornato_il   TIMESTAMPTZ NOT NULL DEFAULT now(),

  canale          TEXT NOT NULL CHECK (canale IN ('email', 'whatsapp', 'reminder', 'sistema')),
  tipo            TEXT NOT NULL CHECK (tipo IN (
    'conferma_prenotazione_inviata',
    'acconto_richiesto',
    'acconto_ricevuto',
    'saldo_richiesto',
    'saldo_ricevuto',
    'documenti_richiesti',
    'documenti_ricevuti',
    'reminder_partenza',
    'bentornato'
  )),
  stato           TEXT NOT NULL CHECK (stato IN (
    'in_coda', 'inviata', 'consegnata', 'letta', 'fallita', 'programmata'
  )),
  oggetto         TEXT NOT NULL DEFAULT '',
  anteprima       TEXT NOT NULL DEFAULT '',
  programmata_il  TIMESTAMPTZ,
  inviata_il      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comunicazioni_cliente_id
  ON public.comunicazioni (cliente_id);

CREATE INDEX IF NOT EXISTS idx_comunicazioni_stato
  ON public.comunicazioni (stato);

CREATE INDEX IF NOT EXISTS idx_comunicazioni_canale
  ON public.comunicazioni (canale);

DROP TRIGGER IF EXISTS trg_comunicazioni_updated_at ON public.comunicazioni;

CREATE TRIGGER trg_comunicazioni_updated_at
  BEFORE UPDATE ON public.comunicazioni
  FOR EACH ROW
  EXECUTE FUNCTION public.set_aggiornato_il();

ALTER TABLE public.comunicazioni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comunicazioni_select_anon" ON public.comunicazioni;
DROP POLICY IF EXISTS "comunicazioni_insert_anon" ON public.comunicazioni;
DROP POLICY IF EXISTS "comunicazioni_update_anon" ON public.comunicazioni;
DROP POLICY IF EXISTS "comunicazioni_delete_anon" ON public.comunicazioni;

CREATE POLICY "comunicazioni_select_anon"
  ON public.comunicazioni FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "comunicazioni_insert_anon"
  ON public.comunicazioni FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "comunicazioni_update_anon"
  ON public.comunicazioni FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "comunicazioni_delete_anon"
  ON public.comunicazioni FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.comunicazioni IS 'Comunicazioni inviate o programmate verso i clienti';

-- ---------------------------------------------------------------------------
-- Tabella comunicazione_eventi (milestone timeline per cliente)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comunicazione_eventi (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES public.clienti (id) ON DELETE CASCADE,
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),
  aggiornato_il   TIMESTAMPTZ NOT NULL DEFAULT now(),

  tipo            TEXT NOT NULL CHECK (tipo IN (
    'conferma_prenotazione_inviata',
    'acconto_richiesto',
    'acconto_ricevuto',
    'saldo_richiesto',
    'saldo_ricevuto',
    'documenti_richiesti',
    'documenti_ricevuti',
    'reminder_partenza',
    'bentornato'
  )),
  titolo          TEXT NOT NULL DEFAULT '',
  descrizione     TEXT NOT NULL DEFAULT '',
  completato      BOOLEAN NOT NULL DEFAULT false,
  data            TIMESTAMPTZ,

  UNIQUE (cliente_id, tipo)
);

CREATE INDEX IF NOT EXISTS idx_comunicazione_eventi_cliente_id
  ON public.comunicazione_eventi (cliente_id);

DROP TRIGGER IF EXISTS trg_comunicazione_eventi_updated_at ON public.comunicazione_eventi;

CREATE TRIGGER trg_comunicazione_eventi_updated_at
  BEFORE UPDATE ON public.comunicazione_eventi
  FOR EACH ROW
  EXECUTE FUNCTION public.set_aggiornato_il();

ALTER TABLE public.comunicazione_eventi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comunicazione_eventi_select_anon" ON public.comunicazione_eventi;
DROP POLICY IF EXISTS "comunicazione_eventi_insert_anon" ON public.comunicazione_eventi;
DROP POLICY IF EXISTS "comunicazione_eventi_update_anon" ON public.comunicazione_eventi;
DROP POLICY IF EXISTS "comunicazione_eventi_delete_anon" ON public.comunicazione_eventi;

CREATE POLICY "comunicazione_eventi_select_anon"
  ON public.comunicazione_eventi FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "comunicazione_eventi_insert_anon"
  ON public.comunicazione_eventi FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "comunicazione_eventi_update_anon"
  ON public.comunicazione_eventi FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "comunicazione_eventi_delete_anon"
  ON public.comunicazione_eventi FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.comunicazione_eventi IS 'Milestone comunicazioni per timeline cliente';

-- ---------------------------------------------------------------------------
-- Tabella email_templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),
  aggiornato_il   TIMESTAMPTZ NOT NULL DEFAULT now(),

  titolo          TEXT NOT NULL,
  oggetto         TEXT NOT NULL DEFAULT '',
  corpo_html      TEXT NOT NULL DEFAULT '',
  categoria       TEXT NOT NULL CHECK (categoria IN (
    'prenotazione',
    'pagamenti',
    'documenti',
    'partenza',
    'post_viaggio',
    'generale'
  ))
);

CREATE INDEX IF NOT EXISTS idx_email_templates_categoria
  ON public.email_templates (categoria);

CREATE INDEX IF NOT EXISTS idx_email_templates_titolo
  ON public.email_templates (titolo);

DROP TRIGGER IF EXISTS trg_email_templates_updated_at ON public.email_templates;

CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_aggiornato_il();

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_templates_select_anon" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_insert_anon" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_update_anon" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_delete_anon" ON public.email_templates;

CREATE POLICY "email_templates_select_anon"
  ON public.email_templates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "email_templates_insert_anon"
  ON public.email_templates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "email_templates_update_anon"
  ON public.email_templates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "email_templates_delete_anon"
  ON public.email_templates FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.email_templates IS 'Template email riutilizzabili con variabili dinamiche';

-- ---------------------------------------------------------------------------
-- Tabella cliente_timeline_eventi
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cliente_timeline_eventi (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES public.clienti (id) ON DELETE CASCADE,
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),

  tipo            TEXT NOT NULL CHECK (tipo IN (
    'cliente_creato',
    'iscritto_tour',
    'pagamento',
    'documento_caricato',
    'camera_assegnata',
    'email_inviata',
    'whatsapp_inviato',
    'checklist_completata',
    'tour_concluso'
  )),
  titolo          TEXT NOT NULL DEFAULT '',
  descrizione     TEXT NOT NULL DEFAULT '',
  data            TIMESTAMPTZ NOT NULL DEFAULT now(),
  utente          TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_cliente_timeline_eventi_cliente_id
  ON public.cliente_timeline_eventi (cliente_id);

CREATE INDEX IF NOT EXISTS idx_cliente_timeline_eventi_data
  ON public.cliente_timeline_eventi (data DESC);

CREATE INDEX IF NOT EXISTS idx_cliente_timeline_eventi_tipo
  ON public.cliente_timeline_eventi (tipo);

ALTER TABLE public.cliente_timeline_eventi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cliente_timeline_eventi_select_anon" ON public.cliente_timeline_eventi;
DROP POLICY IF EXISTS "cliente_timeline_eventi_insert_anon" ON public.cliente_timeline_eventi;
DROP POLICY IF EXISTS "cliente_timeline_eventi_update_anon" ON public.cliente_timeline_eventi;
DROP POLICY IF EXISTS "cliente_timeline_eventi_delete_anon" ON public.cliente_timeline_eventi;

CREATE POLICY "cliente_timeline_eventi_select_anon"
  ON public.cliente_timeline_eventi FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "cliente_timeline_eventi_insert_anon"
  ON public.cliente_timeline_eventi FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "cliente_timeline_eventi_update_anon"
  ON public.cliente_timeline_eventi FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cliente_timeline_eventi_delete_anon"
  ON public.cliente_timeline_eventi FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.cliente_timeline_eventi IS 'Timeline eventi scheda cliente';

-- ---------------------------------------------------------------------------
-- Tabella audit_log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),

  utente          TEXT NOT NULL DEFAULT '',
  azione          TEXT NOT NULL DEFAULT '',
  tipo            TEXT NOT NULL CHECK (tipo IN (
    'cliente',
    'pagamento',
    'camera',
    'tour',
    'documento',
    'partecipante',
    'comunicazione',
    'template_email',
    'checklist',
    'generale'
  )),
  azione_tipo     TEXT NOT NULL CHECK (azione_tipo IN (
    'creato',
    'modificato',
    'aggiornato',
    'eliminato',
    'assegnato',
    'cambiato',
    'inviato',
    'completato'
  )),
  entita_id       TEXT,
  entita_label    TEXT NOT NULL DEFAULT '',
  data            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_data
  ON public.audit_log (data DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_tipo
  ON public.audit_log (tipo);

CREATE INDEX IF NOT EXISTS idx_audit_log_utente
  ON public.audit_log (utente);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_select_anon" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_insert_anon" ON public.audit_log;

CREATE POLICY "audit_log_select_anon"
  ON public.audit_log FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "audit_log_insert_anon"
  ON public.audit_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.audit_log IS 'Registro audit di tutte le modifiche nel gestionale';

-- ---------------------------------------------------------------------------
-- Tabella notifiche
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifiche (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),

  tipo            TEXT NOT NULL CHECK (tipo IN (
    'saldo_mancante',
    'documento_scadenza',
    'tour_partenza',
    'camera_incompleta',
    'pagamento_ricevuto',
    'cliente_nuovo'
  )),
  titolo          TEXT NOT NULL DEFAULT '',
  messaggio       TEXT NOT NULL DEFAULT '',
  href            TEXT,
  letta           BOOLEAN NOT NULL DEFAULT false,
  data            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifiche_data
  ON public.notifiche (data DESC);

CREATE INDEX IF NOT EXISTS idx_notifiche_letta
  ON public.notifiche (letta);

CREATE INDEX IF NOT EXISTS idx_notifiche_tipo
  ON public.notifiche (tipo);

ALTER TABLE public.notifiche ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifiche_select_anon" ON public.notifiche;
DROP POLICY IF EXISTS "notifiche_insert_anon" ON public.notifiche;
DROP POLICY IF EXISTS "notifiche_update_anon" ON public.notifiche;

CREATE POLICY "notifiche_select_anon"
  ON public.notifiche FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "notifiche_insert_anon"
  ON public.notifiche FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "notifiche_update_anon"
  ON public.notifiche FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.notifiche IS 'Centro notifiche del gestionale';

-- ---------------------------------------------------------------------------
-- Tabella email_invii
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_invii (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),

  cliente_id      UUID NOT NULL REFERENCES public.clienti (id) ON DELETE CASCADE,
  destinatario    TEXT NOT NULL,
  oggetto         TEXT NOT NULL DEFAULT '',
  messaggio       TEXT NOT NULL DEFAULT '',
  template_id     UUID REFERENCES public.email_templates (id) ON DELETE SET NULL,
  allegati        TEXT[] NOT NULL DEFAULT '{}',
  utente          TEXT NOT NULL DEFAULT '',
  inviata_il      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_invii_cliente_id
  ON public.email_invii (cliente_id);

CREATE INDEX IF NOT EXISTS idx_email_invii_inviata_il
  ON public.email_invii (inviata_il DESC);

ALTER TABLE public.email_invii ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_invii_select_anon" ON public.email_invii;
DROP POLICY IF EXISTS "email_invii_insert_anon" ON public.email_invii;

CREATE POLICY "email_invii_select_anon"
  ON public.email_invii FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "email_invii_insert_anon"
  ON public.email_invii FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.email_invii IS 'Storico invii email simulati dal gestionale';

-- ---------------------------------------------------------------------------
-- Tabella whatsapp_conversazioni
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_conversazioni (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggiornato_il     TIMESTAMPTZ NOT NULL DEFAULT now(),

  cliente_id        UUID NOT NULL UNIQUE REFERENCES public.clienti (id) ON DELETE CASCADE,
  numero            TEXT NOT NULL DEFAULT '',
  ultimo_messaggio  TEXT NOT NULL DEFAULT '',
  data              TIMESTAMPTZ NOT NULL DEFAULT now(),
  stato             TEXT NOT NULL CHECK (stato IN (
    'inviato', 'consegnato', 'letto', 'in_coda', 'fallito'
  ))
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversazioni_cliente_id
  ON public.whatsapp_conversazioni (cliente_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversazioni_data
  ON public.whatsapp_conversazioni (data DESC);

ALTER TABLE public.whatsapp_conversazioni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_conversazioni_select_anon" ON public.whatsapp_conversazioni;
DROP POLICY IF EXISTS "whatsapp_conversazioni_insert_anon" ON public.whatsapp_conversazioni;
DROP POLICY IF EXISTS "whatsapp_conversazioni_update_anon" ON public.whatsapp_conversazioni;

CREATE POLICY "whatsapp_conversazioni_select_anon"
  ON public.whatsapp_conversazioni FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "whatsapp_conversazioni_insert_anon"
  ON public.whatsapp_conversazioni FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "whatsapp_conversazioni_update_anon"
  ON public.whatsapp_conversazioni FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.whatsapp_conversazioni IS 'Conversazioni WhatsApp per cliente';

-- ---------------------------------------------------------------------------
-- Tabella whatsapp_invii
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_invii (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),

  cliente_id      UUID NOT NULL REFERENCES public.clienti (id) ON DELETE CASCADE,
  numero          TEXT NOT NULL,
  messaggio       TEXT NOT NULL DEFAULT '',
  template_id     TEXT,
  utente          TEXT NOT NULL DEFAULT '',
  inviato_il      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_invii_cliente_id
  ON public.whatsapp_invii (cliente_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_invii_inviato_il
  ON public.whatsapp_invii (inviato_il DESC);

ALTER TABLE public.whatsapp_invii ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_invii_select_anon" ON public.whatsapp_invii;
DROP POLICY IF EXISTS "whatsapp_invii_insert_anon" ON public.whatsapp_invii;

CREATE POLICY "whatsapp_invii_select_anon"
  ON public.whatsapp_invii FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "whatsapp_invii_insert_anon"
  ON public.whatsapp_invii FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.whatsapp_invii IS 'Storico invii WhatsApp simulati';

-- ---------------------------------------------------------------------------
-- Tabella whatsapp_templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),
  aggiornato_il   TIMESTAMPTZ NOT NULL DEFAULT now(),

  titolo          TEXT NOT NULL,
  messaggio       TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_templates_select_anon" ON public.whatsapp_templates;

CREATE POLICY "whatsapp_templates_select_anon"
  ON public.whatsapp_templates FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.whatsapp_templates IS 'Template messaggi WhatsApp riutilizzabili';

-- ---------------------------------------------------------------------------
-- Tabella schedulazioni
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedulazioni (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),
  aggiornato_il   TIMESTAMPTZ NOT NULL DEFAULT now(),

  titolo          TEXT NOT NULL,
  cliente_id      UUID NOT NULL REFERENCES public.clienti (id) ON DELETE CASCADE,
  cliente_nome    TEXT NOT NULL DEFAULT '',
  tour_id         TEXT,
  tour_nome       TEXT,
  tipo            TEXT NOT NULL CHECK (tipo IN ('email', 'whatsapp', 'reminder')),
  data            DATE NOT NULL,
  ora             TIME NOT NULL,
  stato           TEXT NOT NULL CHECK (stato IN (
    'programmata', 'inviata', 'fallita', 'bozza'
  ))
);

CREATE INDEX IF NOT EXISTS idx_schedulazioni_cliente_id
  ON public.schedulazioni (cliente_id);

CREATE INDEX IF NOT EXISTS idx_schedulazioni_stato
  ON public.schedulazioni (stato);

CREATE INDEX IF NOT EXISTS idx_schedulazioni_data
  ON public.schedulazioni (data DESC, ora DESC);

CREATE INDEX IF NOT EXISTS idx_schedulazioni_tipo
  ON public.schedulazioni (tipo);

DROP TRIGGER IF EXISTS trg_schedulazioni_updated_at ON public.schedulazioni;

CREATE TRIGGER trg_schedulazioni_updated_at
  BEFORE UPDATE ON public.schedulazioni
  FOR EACH ROW
  EXECUTE FUNCTION public.set_aggiornato_il();

ALTER TABLE public.schedulazioni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedulazioni_select_anon" ON public.schedulazioni;
DROP POLICY IF EXISTS "schedulazioni_insert_anon" ON public.schedulazioni;
DROP POLICY IF EXISTS "schedulazioni_update_anon" ON public.schedulazioni;
DROP POLICY IF EXISTS "schedulazioni_delete_anon" ON public.schedulazioni;

CREATE POLICY "schedulazioni_select_anon"
  ON public.schedulazioni FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "schedulazioni_insert_anon"
  ON public.schedulazioni FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "schedulazioni_update_anon"
  ON public.schedulazioni FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "schedulazioni_delete_anon"
  ON public.schedulazioni FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.schedulazioni IS 'Scheduler comunicazioni — email, WhatsApp e reminder';

-- ---------------------------------------------------------------------------
-- Tabella automazioni
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automazioni (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creato_il           TIMESTAMPTZ NOT NULL DEFAULT now(),
  aggiornato_il       TIMESTAMPTZ NOT NULL DEFAULT now(),

  nome                TEXT NOT NULL,
  trigger             TEXT NOT NULL CHECK (trigger IN (
    'saldo_mancante', 'passaporto_scadenza',
    'una_settimana_mancante', 'tour_terminato'
  )),
  azione              TEXT NOT NULL CHECK (azione IN (
    'invia_reminder', 'crea_notifica',
    'invia_email', 'invia_richiesta_recensione'
  )),
  stato               TEXT NOT NULL CHECK (stato IN (
    'attivo', 'inattivo', 'bozza'
  )),
  ultima_esecuzione   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_automazioni_stato
  ON public.automazioni (stato);

CREATE INDEX IF NOT EXISTS idx_automazioni_trigger
  ON public.automazioni (trigger);

CREATE INDEX IF NOT EXISTS idx_automazioni_ultima_esecuzione
  ON public.automazioni (ultima_esecuzione DESC NULLS LAST);

DROP TRIGGER IF EXISTS trg_automazioni_updated_at ON public.automazioni;

CREATE TRIGGER trg_automazioni_updated_at
  BEFORE UPDATE ON public.automazioni
  FOR EACH ROW
  EXECUTE FUNCTION public.set_aggiornato_il();

ALTER TABLE public.automazioni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "automazioni_select_anon" ON public.automazioni;
DROP POLICY IF EXISTS "automazioni_insert_anon" ON public.automazioni;
DROP POLICY IF EXISTS "automazioni_update_anon" ON public.automazioni;
DROP POLICY IF EXISTS "automazioni_delete_anon" ON public.automazioni;

CREATE POLICY "automazioni_select_anon"
  ON public.automazioni FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "automazioni_insert_anon"
  ON public.automazioni FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "automazioni_update_anon"
  ON public.automazioni FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "automazioni_delete_anon"
  ON public.automazioni FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.automazioni IS 'Workflow automatici — regole trigger → azione';
