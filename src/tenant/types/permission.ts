import type { PermissionId } from "./ids";
import type { RoleScope } from "./role";

export type PermissionAction = "read" | "write" | "delete" | "manage";

export type PermissionResource =
  | "organization"
  | "workspace"
  | "membership"
  | "clienti"
  | "tour"
  | "pagamenti"
  | "comunicazioni"
  | "dashboard"
  | "settings"
  | "audit"
  | "automazioni";

export interface Permission {
  id: PermissionId;
  key: string;
  resource: PermissionResource;
  action: PermissionAction;
  description: string;
  scope: RoleScope;
}

export type PermissionKey = `${PermissionResource}:${PermissionAction}`;
