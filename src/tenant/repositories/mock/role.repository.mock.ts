import { createRole } from "@/tenant/models";
import { SYSTEM_ROLES } from "@/tenant/constants";
import type { IRoleRepository } from "@/tenant/interfaces";
import type {
  CreateRoleInput,
  OrganizationId,
  Role,
  RoleId,
  RoleScope,
  UpdateRoleInput,
} from "@/tenant/types";

export class RoleRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleRepositoryError";
  }
}

export class MockRoleRepository implements IRoleRepository {
  private store = new Map<RoleId, Role>();

  constructor(seed = true) {
    if (seed) {
      for (const role of SYSTEM_ROLES) {
        this.store.set(role.id, { ...role });
      }
    }
  }

  async findById(id: RoleId): Promise<Role | null> {
    const role = this.store.get(id);
    return role ? { ...role, permissionIds: [...role.permissionIds] } : null;
  }

  async findByKey(key: string): Promise<Role | null> {
    const normalized = key.trim().toLowerCase();
    for (const role of this.store.values()) {
      if (role.key === normalized) {
        return { ...role, permissionIds: [...role.permissionIds] };
      }
    }
    return null;
  }

  async list(): Promise<Role[]> {
    return [...this.store.values()].map((role) => ({
      ...role,
      permissionIds: [...role.permissionIds],
    }));
  }

  async listByScope(scope: RoleScope): Promise<Role[]> {
    return (await this.list()).filter((role) => role.scope === scope);
  }

  async listByOrganization(organizationId: OrganizationId): Promise<Role[]> {
    return (await this.list()).filter(
      (role) =>
        role.organizationId === organizationId ||
        (role.isSystem && role.organizationId === null),
    );
  }

  async create(input: CreateRoleInput): Promise<Role> {
    const existing = await this.findByKey(input.key);
    if (existing) {
      throw new RoleRepositoryError(`Role key "${input.key}" already exists`);
    }

    const role = createRole(input);
    this.store.set(role.id, role);
    return { ...role, permissionIds: [...role.permissionIds] };
  }

  async update(id: RoleId, input: UpdateRoleInput): Promise<Role> {
    const current = this.store.get(id);
    if (!current) {
      throw new RoleRepositoryError(`Role "${id}" not found`);
    }

    if (current.isSystem) {
      throw new RoleRepositoryError("System roles cannot be modified");
    }

    const updated: Role = {
      ...current,
      ...input,
      permissionIds: input.permissionIds
        ? [...input.permissionIds]
        : current.permissionIds,
      updatedAt: new Date().toISOString(),
    };

    this.store.set(id, updated);
    return { ...updated, permissionIds: [...updated.permissionIds] };
  }

  async delete(id: RoleId): Promise<void> {
    const current = this.store.get(id);
    if (!current) {
      throw new RoleRepositoryError(`Role "${id}" not found`);
    }

    if (current.isSystem) {
      throw new RoleRepositoryError("System roles cannot be deleted");
    }

    this.store.delete(id);
  }
}

export const roleRepository = new MockRoleRepository();
