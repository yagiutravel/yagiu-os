import type { IPermissionRepository } from "@/tenant/interfaces";
import { permissionRepository } from "../repositories";
import type { Permission, PermissionId, PermissionKey, RoleScope } from "@/tenant/types";

export class PermissionService {
  constructor(
    private readonly repository: IPermissionRepository = permissionRepository,
  ) {}

  async getById(id: PermissionId): Promise<Permission | null> {
    return this.repository.findById(id);
  }

  async getByKey(key: PermissionKey | string): Promise<Permission | null> {
    return this.repository.findByKey(key);
  }

  async list(): Promise<Permission[]> {
    return this.repository.list();
  }

  async listByScope(scope: RoleScope): Promise<Permission[]> {
    return this.repository.listByScope(scope);
  }

  async listByIds(ids: PermissionId[]): Promise<Permission[]> {
    return this.repository.listByIds(ids);
  }
}

export const permissionService = new PermissionService();
