import type { Permission, PermissionId, PermissionKey, RoleScope } from "@/tenant/types";

export interface IPermissionRepository {
  findById(id: PermissionId): Promise<Permission | null>;
  findByKey(key: PermissionKey | string): Promise<Permission | null>;
  list(): Promise<Permission[]>;
  listByScope(scope: RoleScope): Promise<Permission[]>;
  listByIds(ids: PermissionId[]): Promise<Permission[]>;
}
