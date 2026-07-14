import type { Role } from "@/tenant/types";

const ORG_OWNER_PERMISSIONS = [
  "perm-organization-read",
  "perm-organization-manage",
  "perm-workspace-read",
  "perm-workspace-manage",
  "perm-membership-read",
  "perm-membership-manage",
];

const ORG_ADMIN_PERMISSIONS = [
  "perm-organization-read",
  "perm-workspace-read",
  "perm-workspace-manage",
  "perm-membership-read",
  "perm-membership-manage",
];

const ORG_MEMBER_PERMISSIONS = ["perm-organization-read", "perm-workspace-read"];

const WORKSPACE_ADMIN_PERMISSIONS = [
  "perm-workspace-read",
  "perm-workspace-manage",
  "perm-membership-read",
  "perm-clienti-read",
  "perm-clienti-write",
  "perm-clienti-delete",
  "perm-tour-read",
  "perm-tour-write",
  "perm-tour-delete",
  "perm-pagamenti-read",
  "perm-pagamenti-write",
  "perm-comunicazioni-read",
  "perm-comunicazioni-write",
  "perm-dashboard-read",
  "perm-settings-read",
  "perm-settings-manage",
  "perm-audit-read",
  "perm-automazioni-read",
  "perm-automazioni-manage",
];

const WORKSPACE_MANAGER_PERMISSIONS = [
  "perm-workspace-read",
  "perm-clienti-read",
  "perm-clienti-write",
  "perm-tour-read",
  "perm-tour-write",
  "perm-pagamenti-read",
  "perm-pagamenti-write",
  "perm-comunicazioni-read",
  "perm-comunicazioni-write",
  "perm-dashboard-read",
  "perm-settings-read",
  "perm-audit-read",
  "perm-automazioni-read",
];

const WORKSPACE_OPERATOR_PERMISSIONS = [
  "perm-workspace-read",
  "perm-clienti-read",
  "perm-clienti-write",
  "perm-tour-read",
  "perm-tour-write",
  "perm-pagamenti-read",
  "perm-comunicazioni-read",
  "perm-comunicazioni-write",
  "perm-dashboard-read",
];

const WORKSPACE_VIEWER_PERMISSIONS = [
  "perm-workspace-read",
  "perm-clienti-read",
  "perm-tour-read",
  "perm-pagamenti-read",
  "perm-comunicazioni-read",
  "perm-dashboard-read",
];

const now = "2026-01-01T00:00:00.000Z";

export const SYSTEM_ROLES: Role[] = [
  {
    id: "role-org-owner",
    key: "org_owner",
    name: "Proprietario",
    description: "Controllo completo sull'organizzazione",
    scope: "organization",
    organizationId: null,
    permissionIds: ORG_OWNER_PERMISSIONS,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role-org-admin",
    key: "org_admin",
    name: "Amministratore",
    description: "Gestione workspace e membri",
    scope: "organization",
    organizationId: null,
    permissionIds: ORG_ADMIN_PERMISSIONS,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role-org-member",
    key: "org_member",
    name: "Membro",
    description: "Accesso base all'organizzazione",
    scope: "organization",
    organizationId: null,
    permissionIds: ORG_MEMBER_PERMISSIONS,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role-ws-admin",
    key: "workspace_admin",
    name: "Admin Workspace",
    description: "Controllo completo sul workspace",
    scope: "workspace",
    organizationId: null,
    permissionIds: WORKSPACE_ADMIN_PERMISSIONS,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role-ws-manager",
    key: "workspace_manager",
    name: "Manager",
    description: "Gestione operativa clienti, tour e comunicazioni",
    scope: "workspace",
    organizationId: null,
    permissionIds: WORKSPACE_MANAGER_PERMISSIONS,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role-ws-operator",
    key: "workspace_operator",
    name: "Operatore",
    description: "Operatività quotidiana con permessi limitati",
    scope: "workspace",
    organizationId: null,
    permissionIds: WORKSPACE_OPERATOR_PERMISSIONS,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role-ws-viewer",
    key: "workspace_viewer",
    name: "Visualizzatore",
    description: "Sola lettura sui dati del workspace",
    scope: "workspace",
    organizationId: null,
    permissionIds: WORKSPACE_VIEWER_PERMISSIONS,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const ROLE_BY_KEY = new Map(
  SYSTEM_ROLES.map((role) => [role.key, role]),
);

export const ROLE_BY_ID = new Map(SYSTEM_ROLES.map((role) => [role.id, role]));
