import { getSupabaseClient } from "@/config/supabase";
import type { IPermissionRepository } from "@/tenant/interfaces";
import type {
  Permission,
  PermissionAction,
  PermissionId,
  PermissionResource,
  RoleScope,
} from "@/tenant/types";

type PermissionRow = {
  id: string;
  key: string;
  resource: string;
  action: string;
  description: string;
  scope: RoleScope;
};

function mapRow(row: PermissionRow): Permission {
  return {
    id: row.id,
    key: row.key,
    resource: row.resource as PermissionResource,
    action: row.action as PermissionAction,
    description: row.description,
    scope: row.scope,
  };
}

export class SupabasePermissionRepository implements IPermissionRepository {
  async findById(id: PermissionId): Promise<Permission | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as PermissionRow) : null;
  }

  async findByKey(key: string): Promise<Permission | null> {
    const supabase = getSupabaseClient();
    const normalized = key.trim().toLowerCase();
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .eq("key", normalized)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as PermissionRow) : null;
  }

  async list(): Promise<Permission[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .order("key");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as PermissionRow));
  }

  async listByScope(scope: RoleScope): Promise<Permission[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .eq("scope", scope)
      .order("key");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as PermissionRow));
  }

  async listByIds(ids: PermissionId[]): Promise<Permission[]> {
    if (ids.length === 0) return [];

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .in("id", ids);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as PermissionRow));
  }
}

export const permissionRepository = new SupabasePermissionRepository();
