import type {
  CreateMembershipInput,
  CreateOrganizationInput,
  CreateRoleInput,
  CreateWorkspaceInput,
  Membership,
  Organization,
  Role,
  Workspace,
} from "@/tenant/types";

function timestamp(): string {
  return new Date().toISOString();
}

export function createOrganizationId(): string {
  return `org-${crypto.randomUUID()}`;
}

export function createWorkspaceId(): string {
  return `ws-${crypto.randomUUID()}`;
}

export function createMembershipId(): string {
  return `mbr-${crypto.randomUUID()}`;
}

export function createRoleId(): string {
  return `role-${crypto.randomUUID()}`;
}

export function createOrganization(input: CreateOrganizationInput): Organization {
  const now = timestamp();

  return {
    id: createOrganizationId(),
    name: input.name.trim(),
    slug: input.slug.trim().toLowerCase(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

export function createWorkspace(input: CreateWorkspaceInput): Workspace {
  const now = timestamp();

  return {
    id: createWorkspaceId(),
    organizationId: input.organizationId,
    name: input.name.trim(),
    slug: input.slug.trim().toLowerCase(),
    isDefault: input.isDefault ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

export function createMembership(input: CreateMembershipInput): Membership {
  const now = timestamp();

  return {
    id: createMembershipId(),
    userId: input.userId,
    organizationId: input.organizationId,
    workspaceId: input.workspaceId ?? null,
    roleId: input.roleId,
    scope: input.scope,
    status: input.status ?? "active",
    joinedAt: now,
    updatedAt: now,
  };
}

export function createRole(input: CreateRoleInput): Role {
  const now = timestamp();

  return {
    id: createRoleId(),
    key: input.key.trim().toLowerCase(),
    name: input.name.trim(),
    description: input.description.trim(),
    scope: input.scope,
    organizationId: input.organizationId ?? null,
    permissionIds: [...input.permissionIds],
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  };
}
