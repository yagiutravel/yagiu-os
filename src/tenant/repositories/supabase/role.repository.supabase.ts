import { getSupabaseClient } from "@/config/supabase";
import { createRole } from "@/tenant/models";
import type { IRoleRepository } from "@/tenant/interfaces";
import type {
  CreateRoleInput,
  OrganizationId,
  PermissionId,
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

type RoleRow = {
  id: string;
  key: string;
  name: string;
  description: string;
  scope: RoleScope;
  organization_id: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

type RolePermissionRow = {
  permission_id: string;
};

function mapRoleRow(row: RoleRow, permissionIds: PermissionId[]): Role {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    scope: row.scope,
    organizationId: row.organization_id,
    permissionIds,
    isSystem: row.is_system,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadPermissionIds(roleId: RoleId): Promise<PermissionId[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => (row as RolePermissionRow).permission_id);
}

async function replaceRolePermissions(
  roleId: RoleId,
  permissionIds: PermissionId[],
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);
  if (deleteError) throw new Error(deleteError.message);

  if (permissionIds.length === 0) return;

  const { error: insertError } = await supabase.from("role_permissions").insert(
    permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    })),
  );
  if (insertError) throw new Error(insertError.message);
}

export class SupabaseRoleRepository implements IRoleRepository {
  private async mapRoleWithPermissions(row: RoleRow): Promise<Role> {
    const permissionIds = await loadPermissionIds(row.id);
    return mapRoleRow(row, permissionIds);
  }

  async findById(id: RoleId): Promise<Role | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.mapRoleWithPermissions(data as RoleRow);
  }

  async findByKey(key: string): Promise<Role | null> {
    const supabase = getSupabaseClient();
    const normalized = key.trim().toLowerCase();
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .eq("key", normalized)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.mapRoleWithPermissions(data as RoleRow);
  }

  async list(): Promise<Role[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("key");
    if (error) throw new Error(error.message);
    return Promise.all(
      (data ?? []).map((row) => this.mapRoleWithPermissions(row as RoleRow)),
    );
  }

  async listByScope(scope: RoleScope): Promise<Role[]> {
    const roles = await this.list();
    return roles.filter((role) => role.scope === scope);
  }

  async listByOrganization(organizationId: OrganizationId): Promise<Role[]> {
    const roles = await this.list();
    return roles.filter(
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
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("roles")
      .insert({
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        scope: role.scope,
        organization_id: role.organizationId,
        is_system: role.isSystem,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await replaceRolePermissions(role.id, role.permissionIds);
    return mapRoleRow(data as RoleRow, [...role.permissionIds]);
  }

  async update(id: RoleId, input: UpdateRoleInput): Promise<Role> {
    const current = await this.findById(id);
    if (!current) {
      throw new RoleRepositoryError(`Role "${id}" not found`);
    }

    if (current.isSystem) {
      throw new RoleRepositoryError("System roles cannot be modified");
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("roles")
      .update({
        name: input.name,
        description: input.description,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const permissionIds = input.permissionIds ?? current.permissionIds;
    if (input.permissionIds) {
      await replaceRolePermissions(id, permissionIds);
    }

    return mapRoleRow(data as RoleRow, [...permissionIds]);
  }

  async delete(id: RoleId): Promise<void> {
    const current = await this.findById(id);
    if (!current) {
      throw new RoleRepositoryError(`Role "${id}" not found`);
    }

    if (current.isSystem) {
      throw new RoleRepositoryError("System roles cannot be deleted");
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export const roleRepository = new SupabaseRoleRepository();
