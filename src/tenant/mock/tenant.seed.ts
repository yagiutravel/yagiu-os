import type {
  Membership,
  Organization,
  Workspace,
} from "@/tenant/types";

export const DEFAULT_ORGANIZATION_ID = "org-yagiu";
export const DEFAULT_WORKSPACE_ID = "ws-yagiu-main";
export const DEFAULT_USER_ID = "user-laura-bianchi";

const now = "2026-01-01T00:00:00.000Z";

export const DEFAULT_ORGANIZATION: Organization = {
  id: DEFAULT_ORGANIZATION_ID,
  name: "Yagiu Travel",
  slug: "yagiu-travel",
  status: "active",
  createdAt: now,
  updatedAt: now,
};

export const DEFAULT_WORKSPACE: Workspace = {
  id: DEFAULT_WORKSPACE_ID,
  organizationId: DEFAULT_ORGANIZATION_ID,
  name: "Workspace principale",
  slug: "main",
  isDefault: true,
  createdAt: now,
  updatedAt: now,
};

export const DEFAULT_MEMBERSHIPS: Membership[] = [
  {
    id: "mbr-org-owner",
    userId: DEFAULT_USER_ID,
    organizationId: DEFAULT_ORGANIZATION_ID,
    workspaceId: null,
    roleId: "role-org-owner",
    scope: "organization",
    status: "active",
    joinedAt: now,
    updatedAt: now,
  },
  {
    id: "mbr-ws-admin",
    userId: DEFAULT_USER_ID,
    organizationId: DEFAULT_ORGANIZATION_ID,
    workspaceId: DEFAULT_WORKSPACE_ID,
    roleId: "role-ws-admin",
    scope: "workspace",
    status: "active",
    joinedAt: now,
    updatedAt: now,
  },
];

export function getDefaultTenantContext() {
  return {
    organizationId: DEFAULT_ORGANIZATION_ID,
    workspaceId: DEFAULT_WORKSPACE_ID,
    userId: DEFAULT_USER_ID,
    membershipId: "mbr-ws-admin",
  } as const;
}
