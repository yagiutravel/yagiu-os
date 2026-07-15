-- Sprint 5.2: Ruoli e permessi (catalogo sistema in DB)
-- Prerequisito: Sprint 3 (organizations, memberships)

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  resource    TEXT NOT NULL,
  action      TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  scope       TEXT NOT NULL CHECK (scope IN ('organization', 'workspace', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_permissions_scope ON public.permissions (scope);

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id              TEXT PRIMARY KEY,
  key             TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  scope           TEXT NOT NULL CHECK (scope IN ('organization', 'workspace', 'system')),
  organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
  is_system       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roles_scope ON public.roles (scope);
CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON public.roles (organization_id);

DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Role permissions (junction)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id       TEXT NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES public.permissions (id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id
  ON public.role_permissions (permission_id);

-- ---------------------------------------------------------------------------
-- Seed permissions
-- ---------------------------------------------------------------------------
INSERT INTO public.permissions (id, key, resource, action, description, scope) VALUES
  ('perm-organization-read', 'organization:read', 'organization', 'read', 'Visualizzare i dati dell''organizzazione', 'organization'),
  ('perm-organization-manage', 'organization:manage', 'organization', 'manage', 'Gestire impostazioni e configurazione organizzazione', 'organization'),
  ('perm-workspace-read', 'workspace:read', 'workspace', 'read', 'Visualizzare workspace', 'workspace'),
  ('perm-workspace-manage', 'workspace:manage', 'workspace', 'manage', 'Creare e gestire workspace', 'workspace'),
  ('perm-membership-read', 'membership:read', 'membership', 'read', 'Visualizzare membri e inviti', 'organization'),
  ('perm-membership-manage', 'membership:manage', 'membership', 'manage', 'Invitare, assegnare ruoli e gestire membri', 'organization'),
  ('perm-clienti-read', 'clienti:read', 'clienti', 'read', 'Visualizzare clienti', 'workspace'),
  ('perm-clienti-write', 'clienti:write', 'clienti', 'write', 'Creare e modificare clienti', 'workspace'),
  ('perm-clienti-delete', 'clienti:delete', 'clienti', 'delete', 'Eliminare clienti', 'workspace'),
  ('perm-tour-read', 'tour:read', 'tour', 'read', 'Visualizzare tour e partecipazioni', 'workspace'),
  ('perm-tour-write', 'tour:write', 'tour', 'write', 'Creare e modificare tour', 'workspace'),
  ('perm-tour-delete', 'tour:delete', 'tour', 'delete', 'Eliminare tour', 'workspace'),
  ('perm-pagamenti-read', 'pagamenti:read', 'pagamenti', 'read', 'Visualizzare pagamenti', 'workspace'),
  ('perm-pagamenti-write', 'pagamenti:write', 'pagamenti', 'write', 'Registrare e modificare pagamenti', 'workspace'),
  ('perm-comunicazioni-read', 'comunicazioni:read', 'comunicazioni', 'read', 'Visualizzare comunicazioni', 'workspace'),
  ('perm-comunicazioni-write', 'comunicazioni:write', 'comunicazioni', 'write', 'Inviare e gestire comunicazioni', 'workspace'),
  ('perm-dashboard-read', 'dashboard:read', 'dashboard', 'read', 'Visualizzare dashboard e KPI', 'workspace'),
  ('perm-settings-read', 'settings:read', 'settings', 'read', 'Visualizzare impostazioni workspace', 'workspace'),
  ('perm-settings-manage', 'settings:manage', 'settings', 'manage', 'Modificare impostazioni workspace', 'workspace'),
  ('perm-audit-read', 'audit:read', 'audit', 'read', 'Visualizzare registro attività', 'workspace'),
  ('perm-automazioni-read', 'automazioni:read', 'automazioni', 'read', 'Visualizzare automazioni', 'workspace'),
  ('perm-automazioni-manage', 'automazioni:manage', 'automazioni', 'manage', 'Configurare automazioni', 'workspace')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed system roles
-- ---------------------------------------------------------------------------
INSERT INTO public.roles (id, key, name, description, scope, organization_id, is_system) VALUES
  ('role-org-owner', 'org_owner', 'Proprietario', 'Controllo completo sull''organizzazione', 'organization', NULL, true),
  ('role-org-admin', 'org_admin', 'Amministratore', 'Gestione workspace e membri', 'organization', NULL, true),
  ('role-org-member', 'org_member', 'Membro', 'Accesso base all''organizzazione', 'organization', NULL, true),
  ('role-ws-admin', 'workspace_admin', 'Admin Workspace', 'Controllo completo sul workspace', 'workspace', NULL, true),
  ('role-ws-manager', 'workspace_manager', 'Manager', 'Gestione operativa clienti, tour e comunicazioni', 'workspace', NULL, true),
  ('role-ws-operator', 'workspace_operator', 'Operatore', 'Operatività quotidiana con permessi limitati', 'workspace', NULL, true),
  ('role-ws-viewer', 'workspace_viewer', 'Visualizzatore', 'Sola lettura sui dati del workspace', 'workspace', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed role_permissions
-- ---------------------------------------------------------------------------
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
  ('role-org-owner', 'perm-organization-read'),
  ('role-org-owner', 'perm-organization-manage'),
  ('role-org-owner', 'perm-workspace-read'),
  ('role-org-owner', 'perm-workspace-manage'),
  ('role-org-owner', 'perm-membership-read'),
  ('role-org-owner', 'perm-membership-manage'),
  ('role-org-admin', 'perm-organization-read'),
  ('role-org-admin', 'perm-workspace-read'),
  ('role-org-admin', 'perm-workspace-manage'),
  ('role-org-admin', 'perm-membership-read'),
  ('role-org-admin', 'perm-membership-manage'),
  ('role-org-member', 'perm-organization-read'),
  ('role-org-member', 'perm-workspace-read'),
  ('role-ws-admin', 'perm-workspace-read'),
  ('role-ws-admin', 'perm-workspace-manage'),
  ('role-ws-admin', 'perm-membership-read'),
  ('role-ws-admin', 'perm-clienti-read'),
  ('role-ws-admin', 'perm-clienti-write'),
  ('role-ws-admin', 'perm-clienti-delete'),
  ('role-ws-admin', 'perm-tour-read'),
  ('role-ws-admin', 'perm-tour-write'),
  ('role-ws-admin', 'perm-tour-delete'),
  ('role-ws-admin', 'perm-pagamenti-read'),
  ('role-ws-admin', 'perm-pagamenti-write'),
  ('role-ws-admin', 'perm-comunicazioni-read'),
  ('role-ws-admin', 'perm-comunicazioni-write'),
  ('role-ws-admin', 'perm-dashboard-read'),
  ('role-ws-admin', 'perm-settings-read'),
  ('role-ws-admin', 'perm-settings-manage'),
  ('role-ws-admin', 'perm-audit-read'),
  ('role-ws-admin', 'perm-automazioni-read'),
  ('role-ws-admin', 'perm-automazioni-manage'),
  ('role-ws-manager', 'perm-workspace-read'),
  ('role-ws-manager', 'perm-clienti-read'),
  ('role-ws-manager', 'perm-clienti-write'),
  ('role-ws-manager', 'perm-tour-read'),
  ('role-ws-manager', 'perm-tour-write'),
  ('role-ws-manager', 'perm-pagamenti-read'),
  ('role-ws-manager', 'perm-pagamenti-write'),
  ('role-ws-manager', 'perm-comunicazioni-read'),
  ('role-ws-manager', 'perm-comunicazioni-write'),
  ('role-ws-manager', 'perm-dashboard-read'),
  ('role-ws-manager', 'perm-settings-read'),
  ('role-ws-manager', 'perm-audit-read'),
  ('role-ws-manager', 'perm-automazioni-read'),
  ('role-ws-operator', 'perm-workspace-read'),
  ('role-ws-operator', 'perm-clienti-read'),
  ('role-ws-operator', 'perm-clienti-write'),
  ('role-ws-operator', 'perm-tour-read'),
  ('role-ws-operator', 'perm-tour-write'),
  ('role-ws-operator', 'perm-pagamenti-read'),
  ('role-ws-operator', 'perm-comunicazioni-read'),
  ('role-ws-operator', 'perm-comunicazioni-write'),
  ('role-ws-operator', 'perm-dashboard-read'),
  ('role-ws-viewer', 'perm-workspace-read'),
  ('role-ws-viewer', 'perm-clienti-read'),
  ('role-ws-viewer', 'perm-tour-read'),
  ('role-ws-viewer', 'perm-pagamenti-read'),
  ('role-ws-viewer', 'perm-comunicazioni-read'),
  ('role-ws-viewer', 'perm-dashboard-read')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- RLS (read-only catalog for authenticated users)
-- ---------------------------------------------------------------------------
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS permissions_select_auth ON public.permissions;
CREATE POLICY permissions_select_auth ON public.permissions
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS roles_select_auth ON public.roles;
CREATE POLICY roles_select_auth ON public.roles
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS role_permissions_select_auth ON public.role_permissions;
CREATE POLICY role_permissions_select_auth ON public.role_permissions
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- Grants + PostgREST reload
-- ---------------------------------------------------------------------------
GRANT ALL ON TABLE public.permissions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.roles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.role_permissions TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
