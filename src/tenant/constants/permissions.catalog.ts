import type { Permission } from "@/tenant/types";

const permissionByKey = new Map<string, Permission>();
const permissionById = new Map<string, Permission>();

export function hydratePermissionCatalog(permissions: Permission[]): void {
  permissionByKey.clear();
  permissionById.clear();
  for (const permission of permissions) {
    permissionByKey.set(permission.key, permission);
    permissionById.set(permission.id, permission);
  }
}

export const PERMISSION_BY_KEY = permissionByKey;
export const PERMISSION_BY_ID = permissionById;
