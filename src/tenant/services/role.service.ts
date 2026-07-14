import type { IRoleRepository } from "@/tenant/interfaces";
import { roleRepository } from "../repositories";
import type {
  CreateRoleInput,
  OrganizationId,
  Role,
  RoleId,
  RoleScope,
  UpdateRoleInput,
} from "@/tenant/types";

export class RoleServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleServiceError";
  }
}

export class RoleService {
  constructor(private readonly repository: IRoleRepository = roleRepository) {}

  async getById(id: RoleId): Promise<Role | null> {
    return this.repository.findById(id);
  }

  async getByKey(key: string): Promise<Role | null> {
    return this.repository.findByKey(key);
  }

  async list(): Promise<Role[]> {
    return this.repository.list();
  }

  async listByScope(scope: RoleScope): Promise<Role[]> {
    return this.repository.listByScope(scope);
  }

  async listForOrganization(organizationId: OrganizationId): Promise<Role[]> {
    return this.repository.listByOrganization(organizationId);
  }

  async create(input: CreateRoleInput): Promise<Role> {
    return this.repository.create(input);
  }

  async update(id: RoleId, input: UpdateRoleInput): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new RoleServiceError(`Role "${id}" not found`);
    }
    return this.repository.update(id, input);
  }

  async delete(id: RoleId): Promise<void> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new RoleServiceError(`Role "${id}" not found`);
    }
    return this.repository.delete(id);
  }
}

export const roleService = new RoleService();
