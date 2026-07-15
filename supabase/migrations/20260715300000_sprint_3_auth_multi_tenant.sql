-- Sprint 3: Autenticazione, multi-tenant e sicurezza
-- Prerequisito: schema.sql + migrations Sprint 1A/1B/2

-- ---------------------------------------------------------------------------
-- Audit field trigger (no table dependencies)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_auth_audit_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF to_jsonb(NEW) ? 'created_by' THEN
      NEW.created_by := COALESCE(NEW.created_by, auth.uid());
    END IF;
    IF to_jsonb(NEW) ? 'updated_by' THEN
      NEW.updated_by := COALESCE(NEW.updated_by, auth.uid());
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF to_jsonb(NEW) ? 'updated_by' THEN
      NEW.updated_by := auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Workspaces
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_workspaces_organization_id ON public.workspaces (organization_id);

DROP TRIGGER IF EXISTS trg_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.workspaces (id, organization_id, name, slug, is_default)
VALUES (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'Workspace principale',
  'main',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- User profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id   UUID NOT NULL REFERENCES public.organizations (id) ON DELETE RESTRICT,
  workspace_id      UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE RESTRICT,
  email             TEXT NOT NULL DEFAULT '',
  display_name      TEXT NOT NULL DEFAULT '',
  avatar_url        TEXT,
  job_title         TEXT NOT NULL DEFAULT '',
  phone             TEXT NOT NULL DEFAULT '',
  preferences       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by        UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles (organization_id);

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_profiles_auth_fields ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_auth_fields
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auth_audit_fields();

-- ---------------------------------------------------------------------------
-- Memberships (ruoli e permessi a livello applicativo)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES public.workspaces (id) ON DELETE CASCADE,
  role_key        TEXT NOT NULL CHECK (role_key IN (
    'org_owner', 'org_admin', 'org_member',
    'workspace_admin', 'workspace_manager', 'workspace_operator', 'workspace_viewer'
  )),
  scope           TEXT NOT NULL CHECK (scope IN ('organization', 'workspace')),
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'suspended')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  UNIQUE (user_id, organization_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON public.memberships (organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_workspace_id ON public.memberships (workspace_id);

DROP TRIGGER IF EXISTS trg_memberships_updated_at ON public.memberships;
CREATE TRIGGER trg_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_memberships_auth_fields ON public.memberships;
CREATE TRIGGER trg_memberships_auth_fields
  BEFORE INSERT OR UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auth_audit_fields();

-- ---------------------------------------------------------------------------
-- RLS helper functions (after memberships exists)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = p_org_id
      AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.organization_id
  FROM public.memberships m
  WHERE m.user_id = auth.uid()
    AND m.status = 'active';
$$;

-- Backfill profili e membership per utenti auth già esistenti
INSERT INTO public.user_profiles (id, organization_id, workspace_id, email, display_name)
SELECT
  u.id,
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  COALESCE(u.email, ''),
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data ->> 'display_name'), ''),
    split_part(COALESCE(u.email, ''), '@', 1),
    'Utente'
  )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.memberships (
  user_id, organization_id, workspace_id, role_key, scope, status
)
SELECT
  u.id,
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  'workspace_admin',
  'workspace',
  'active'
FROM auth.users u
ON CONFLICT (user_id, organization_id, workspace_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Auth audit events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auth_audit_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations (id) ON DELETE SET NULL,
  user_id         UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN (
    'login', 'logout', 'password_reset_request', 'password_reset_complete', 'session_refresh'
  )),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_events_user_id ON public.auth_audit_events (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_events_created_at ON public.auth_audit_events (created_at DESC);

-- ---------------------------------------------------------------------------
-- organization_id + updated_by on clienti
-- ---------------------------------------------------------------------------
ALTER TABLE public.clienti
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations (id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;

UPDATE public.clienti
SET organization_id = '00000000-0000-4000-8000-000000000001'
WHERE organization_id IS NULL;

ALTER TABLE public.clienti
  ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clienti_organization_id ON public.clienti (organization_id);

DROP TRIGGER IF EXISTS trg_clienti_auth_fields ON public.clienti;
CREATE TRIGGER trg_clienti_auth_fields
  BEFORE INSERT OR UPDATE ON public.clienti
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auth_audit_fields();

-- ---------------------------------------------------------------------------
-- organization_id on audit_log, notifiche (solo se presenti nello schema legacy)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_log'
  ) THEN
    ALTER TABLE public.audit_log
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

    UPDATE public.audit_log
    SET organization_id = '00000000-0000-4000-8000-000000000001'
    WHERE organization_id IS NULL;

    ALTER TABLE public.audit_log
      ALTER COLUMN organization_id SET NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_audit_log_organization_id ON public.audit_log (organization_id);

    ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_tipo_check;
    ALTER TABLE public.audit_log
      ADD CONSTRAINT audit_log_tipo_check
      CHECK (tipo IN (
        'cliente', 'pagamento', 'camera', 'tour', 'documento', 'partecipante',
        'comunicazione', 'template_email', 'checklist', 'preventivo', 'auth', 'utente', 'generale'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'notifiche'
  ) THEN
    ALTER TABLE public.notifiche
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

    UPDATE public.notifiche
    SET organization_id = '00000000-0000-4000-8000-000000000001'
    WHERE organization_id IS NULL;

    ALTER TABLE public.notifiche
      ALTER COLUMN organization_id SET NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_notifiche_organization_id ON public.notifiche (organization_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- updated_by on tours and preventivi
-- ---------------------------------------------------------------------------
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.preventivi
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_tours_auth_fields ON public.tours;
CREATE TRIGGER trg_tours_auth_fields
  BEFORE INSERT OR UPDATE ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auth_audit_fields();

DROP TRIGGER IF EXISTS trg_preventivi_auth_fields ON public.preventivi;
CREATE TRIGGER trg_preventivi_auth_fields
  BEFORE INSERT OR UPDATE ON public.preventivi
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auth_audit_fields();

-- ---------------------------------------------------------------------------
-- New user bootstrap (profile + membership on signup)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID := '00000000-0000-4000-8000-000000000001';
  v_ws_id UUID := '00000000-0000-4000-8000-000000000002';
  v_display_name TEXT;
BEGIN
  v_display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'display_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  INSERT INTO public.user_profiles (
    id, organization_id, workspace_id, email, display_name
  )
  VALUES (
    NEW.id, v_org_id, v_ws_id, COALESCE(NEW.email, ''), COALESCE(v_display_name, 'Utente')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.user_profiles.display_name),
      updated_at = now();

  INSERT INTO public.memberships (
    user_id, organization_id, workspace_id, role_key, scope, status
  )
  VALUES (
    NEW.id, v_org_id, v_ws_id, 'workspace_admin', 'workspace', 'active'
  )
  ON CONFLICT (user_id, organization_id, workspace_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- RLS: drop permissive anon policies, enforce org membership
-- ---------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_events ENABLE ROW LEVEL SECURITY;

-- Organizations
DROP POLICY IF EXISTS "organizations_select_anon" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert_anon" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_member" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update_member" ON public.organizations;

CREATE POLICY "organizations_select_member" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id));

CREATE POLICY "organizations_update_member" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.is_org_member(id))
  WITH CHECK (public.is_org_member(id));

-- Workspaces
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update_member" ON public.workspaces;

CREATE POLICY "workspaces_select_member" ON public.workspaces
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "workspaces_update_member" ON public.workspaces
  FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- User profiles
DROP POLICY IF EXISTS "user_profiles_select_member" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_self" ON public.user_profiles;

CREATE POLICY "user_profiles_select_member" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR id = auth.uid());

CREATE POLICY "user_profiles_update_self" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Memberships
DROP POLICY IF EXISTS "memberships_select_member" ON public.memberships;
DROP POLICY IF EXISTS "memberships_update_member" ON public.memberships;

CREATE POLICY "memberships_select_member" ON public.memberships
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "memberships_update_member" ON public.memberships
  FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- Auth audit
DROP POLICY IF EXISTS "auth_audit_select_member" ON public.auth_audit_events;
DROP POLICY IF EXISTS "auth_audit_insert_self" ON public.auth_audit_events;

CREATE POLICY "auth_audit_select_member" ON public.auth_audit_events
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL
    OR public.is_org_member(organization_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "auth_audit_insert_self" ON public.auth_audit_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Macro: org-scoped tables with organization_id column
DO $$
DECLARE
  t TEXT;
  org_tables TEXT[] := ARRAY[
    'tours', 'tour_staff', 'tour_hotels', 'tour_participants', 'tour_rooms',
    'room_assignments', 'tour_payments', 'tour_checklist_templates',
    'tour_checklist_completions', 'tour_documents', 'tour_timeline_events',
    'tour_program_days', 'tour_program_activities', 'tour_flights',
    'tour_transfers', 'tour_insurances', 'preventivi', 'preventivo_righe',
    'clienti', 'audit_log', 'notifiche'
  ];
BEGIN
  FOREACH t IN ARRAY org_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_member', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_member', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_member', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_member', t);

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_org_member(organization_id))',
        t || '_select_member', t
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id))',
        t || '_insert_member', t
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id))',
        t || '_update_member', t
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_org_member(organization_id))',
        t || '_delete_member', t
      );
    END IF;
  END LOOP;
END $$;

-- Child tables scoped via clienti.organization_id
DO $$
DECLARE
  child_tables TEXT[] := ARRAY[
    'cliente_questionari', 'comunicazioni', 'cliente_timeline_eventi'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY child_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_member', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_member', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_member', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_member', t);

      EXECUTE format($pol$
        CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.clienti c
            WHERE c.id = cliente_id AND public.is_org_member(c.organization_id)
          )
        )$pol$, t || '_select_member', t);

      EXECUTE format($pol$
        CREATE POLICY %I ON public.%I FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.clienti c
            WHERE c.id = cliente_id AND public.is_org_member(c.organization_id)
          )
        )$pol$, t || '_insert_member', t);

      EXECUTE format($pol$
        CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.clienti c
            WHERE c.id = cliente_id AND public.is_org_member(c.organization_id)
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.clienti c
            WHERE c.id = cliente_id AND public.is_org_member(c.organization_id)
          )
        )$pol$, t || '_update_member', t);

      EXECUTE format($pol$
        CREATE POLICY %I ON public.%I FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.clienti c
            WHERE c.id = cliente_id AND public.is_org_member(c.organization_id)
          )
        )$pol$, t || '_delete_member', t);
    END IF;
  END LOOP;
END $$;

-- comunicazione_eventi via comunicazioni -> clienti
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'comunicazione_eventi'
  ) THEN
    DROP POLICY IF EXISTS "comunicazione_eventi_select_anon" ON public.comunicazione_eventi;
    DROP POLICY IF EXISTS "comunicazione_eventi_insert_anon" ON public.comunicazione_eventi;
    DROP POLICY IF EXISTS "comunicazione_eventi_update_anon" ON public.comunicazione_eventi;
    DROP POLICY IF EXISTS "comunicazione_eventi_delete_anon" ON public.comunicazione_eventi;
    DROP POLICY IF EXISTS "comunicazione_eventi_select_member" ON public.comunicazione_eventi;
    DROP POLICY IF EXISTS "comunicazione_eventi_insert_member" ON public.comunicazione_eventi;
    DROP POLICY IF EXISTS "comunicazione_eventi_update_member" ON public.comunicazione_eventi;
    DROP POLICY IF EXISTS "comunicazione_eventi_delete_member" ON public.comunicazione_eventi;

    CREATE POLICY "comunicazione_eventi_select_member" ON public.comunicazione_eventi
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.comunicazioni com
          JOIN public.clienti c ON c.id = com.cliente_id
          WHERE com.id = comunicazione_id
            AND public.is_org_member(c.organization_id)
        )
      );

    CREATE POLICY "comunicazione_eventi_insert_member" ON public.comunicazione_eventi
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.comunicazioni com
          JOIN public.clienti c ON c.id = com.cliente_id
          WHERE com.id = comunicazione_id
            AND public.is_org_member(c.organization_id)
        )
      );

    CREATE POLICY "comunicazione_eventi_update_member" ON public.comunicazione_eventi
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.comunicazioni com
          JOIN public.clienti c ON c.id = com.cliente_id
          WHERE com.id = comunicazione_id
            AND public.is_org_member(c.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.comunicazioni com
          JOIN public.clienti c ON c.id = com.cliente_id
          WHERE com.id = comunicazione_id
            AND public.is_org_member(c.organization_id)
        )
      );

    CREATE POLICY "comunicazione_eventi_delete_member" ON public.comunicazione_eventi
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.comunicazioni com
          JOIN public.clienti c ON c.id = com.cliente_id
          WHERE com.id = comunicazione_id
            AND public.is_org_member(c.organization_id)
        )
      );
  END IF;
END $$;

-- Remaining legacy tables: authenticated-only (org via default org backfill later)
DO $$
DECLARE
  legacy_tables TEXT[] := ARRAY[
    'email_templates', 'email_invii', 'whatsapp_conversazioni', 'whatsapp_invii',
    'whatsapp_templates', 'schedulazioni', 'automazioni'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY legacy_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_anon', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_auth', t);

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)',
        t || '_select_auth', t
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)',
        t || '_insert_auth', t
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)',
        t || '_update_auth', t
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)',
        t || '_delete_auth', t
      );
    END IF;
  END LOOP;
END $$;

-- Ricarica schema PostgREST dopo nuove tabelle/policies
GRANT ALL ON TABLE public.workspaces TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.memberships TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.auth_audit_events TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
