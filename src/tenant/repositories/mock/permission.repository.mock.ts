import { SYSTEM_PERMISSIONS } from "@/tenant/constants";
import type { IPermissionRepository } from "@/tenant/interfaces";
import type { Permission, PermissionId, RoleScope } from "@/tenant/types";

export class MockPermissionRepository implements IPermissionRepository {
  private readonly store = new Map<PermissionId, Permission>(
    SYSTEM_PERMISSIONS.map((permission) => [permission.id, permission]),
  );

  async findById(id: PermissionId): Promise<Permission | null> {
    const permission = this.store.get(id);
    return permission ? { ...permission } : null;
  }

  async findByKey(key: string): Promise<Permission | null> {
    const normalized = key.trim().toLowerCase();
    for (const permission of this.store.values()) {
      if (permission.key === normalized) {
        return { ...permission };
      }
    }
    return null;
  }

  async list(): Promise<Permission[]> {
    return [...this.store.values()].map((permission) => ({ ...permission }));
  }

  async listByScope(scope: RoleScope): Promise<Permission[]> {
    return (await this.list()).filter((permission) => permission.scope === scope);
  }

  async listByIds(ids: PermissionId[]): Promise<Permission[]> {
    return ids
      .map((id) => this.store.get(id))
      .filter((permission): permission is Permission => Boolean(permission))
      .map((permission) => ({ ...permission }));
  }
}

export const permissionRepository = new MockPermissionRepository();
