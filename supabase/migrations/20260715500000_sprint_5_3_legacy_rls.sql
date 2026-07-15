-- Sprint 5.3: RLS org-scoped su tabelle legacy email/whatsapp/schedulazioni/automazioni
-- Prerequisito: Sprint 3 (is_org_member, clienti.organization_id)

-- ---------------------------------------------------------------------------
-- organization_id su tabelle org-wide (template + automazioni)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'email_templates'
  ) THEN
    ALTER TABLE public.email_templates
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;

    UPDATE public.email_templates
    SET organization_id = '00000000-0000-4000-8000-000000000001'
    WHERE organization_id IS NULL;

    ALTER TABLE public.email_templates
      ALTER COLUMN organization_id SET DEFAULT '00000000-0000-4000-8000-000000000001';

    ALTER TABLE public.email_templates
      ALTER COLUMN organization_id SET NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_email_templates_organization_id
      ON public.email_templates (organization_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'whatsapp_templates'
  ) THEN
    ALTER TABLE public.whatsapp_templates
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;

    UPDATE public.whatsapp_templates
    SET organization_id = '00000000-0000-4000-8000-000000000001'
    WHERE organization_id IS NULL;

    ALTER TABLE public.whatsapp_templates
      ALTER COLUMN organization_id SET DEFAULT '00000000-0000-4000-8000-000000000001';

    ALTER TABLE public.whatsapp_templates
      ALTER COLUMN organization_id SET NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_organization_id
      ON public.whatsapp_templates (organization_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'automazioni'
  ) THEN
    ALTER TABLE public.automazioni
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;

    UPDATE public.automazioni
    SET organization_id = '00000000-0000-4000-8000-000000000001'
    WHERE organization_id IS NULL;

    ALTER TABLE public.automazioni
      ALTER COLUMN organization_id SET DEFAULT '00000000-0000-4000-8000-000000000001';

    ALTER TABLE public.automazioni
      ALTER COLUMN organization_id SET NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_automazioni_organization_id
      ON public.automazioni (organization_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Child tables scoped via clienti.organization_id
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  child_tables TEXT[] := ARRAY[
    'email_invii', 'whatsapp_conversazioni', 'whatsapp_invii', 'schedulazioni'
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
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_auth', t);
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

-- ---------------------------------------------------------------------------
-- Org-scoped tables with organization_id column
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  org_tables TEXT[] := ARRAY[
    'email_templates', 'whatsapp_templates', 'automazioni'
  ];
  t TEXT;
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
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_auth', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_auth', t);
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

NOTIFY pgrst, 'reload schema';
