import type { OrganizationId, PermissionId, RoleId } from "./ids";

export type RoleScope = "organization" | "workspace" | "system";

export interface Role {
  id: RoleId;
  key: string;
  name: string;
  description: string;
  scope: RoleScope;
  organizationId: OrganizationId | null;
  permissionIds: PermissionId[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  key: string;
  name: string;
  description: string;
  scope: RoleScope;
  organizationId?: OrganizationId | null;
  permissionIds: PermissionId[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissionIds?: PermissionId[];
}
