import type {
  CreateRoleInput,
  OrganizationId,
  Role,
  RoleId,
  RoleScope,
  UpdateRoleInput,
} from "@/tenant/types";

export interface IRoleRepository {
  findById(id: RoleId): Promise<Role | null>;
  findByKey(key: string): Promise<Role | null>;
  list(): Promise<Role[]>;
  listByScope(scope: RoleScope): Promise<Role[]>;
  listByOrganization(organizationId: OrganizationId): Promise<Role[]>;
  create(input: CreateRoleInput): Promise<Role>;
  update(id: RoleId, input: UpdateRoleInput): Promise<Role>;
  delete(id: RoleId): Promise<void>;
}
