import { getSupabaseClient } from "@/config/supabase";
import { roleRepository } from "./role.repository.supabase";
import type { IMembershipRepository } from "@/tenant/interfaces";
import type {
  CreateMembershipInput,
  Membership,
  MembershipId,
  OrganizationId,
  UpdateMembershipInput,
  UserId,
  WorkspaceId,
} from "@/tenant/types";

type MembershipRow = {
  id: string;
  user_id: string;
  organization_id: string;
  workspace_id: string | null;
  role_key: string;
  scope: "organization" | "workspace";
  status: "active" | "invited" | "suspended";
  joined_at: string;
  updated_at: string;
};

async function mapRow(row: MembershipRow): Promise<Membership> {
  const role = await roleRepository.findByKey(row.role_key);
  return {
    id: row.id,
    userId: row.user_id,
    organizationId: row.organization_id,
    workspaceId: row.workspace_id,
    roleId: role?.id ?? row.role_key,
    scope: row.scope,
    status: row.status,
    joinedAt: row.joined_at,
    updatedAt: row.updated_at,
  };
}

async function resolveRoleKey(roleId: string): Promise<string> {
  const role =
    (await roleRepository.findById(roleId)) ??
    (await roleRepository.findByKey(roleId));
  return role?.key ?? roleId;
}

export class SupabaseMembershipRepository implements IMembershipRepository {
  async findById(id: MembershipId): Promise<Membership | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as MembershipRow) : null;
  }

  async listByOrganization(organizationId: OrganizationId): Promise<Membership[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((row) => mapRow(row as MembershipRow)));
  }

  async listByWorkspace(workspaceId: WorkspaceId): Promise<Membership[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((row) => mapRow(row as MembershipRow)));
  }

  async findByUserAndOrganization(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<Membership | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("scope", "organization")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as MembershipRow) : null;
  }

  async findByUserAndWorkspace(
    userId: UserId,
    workspaceId: WorkspaceId,
  ): Promise<Membership | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("workspace_id", workspaceId)
      .eq("scope", "workspace")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as MembershipRow) : null;
  }

  async listByUser(userId: UserId): Promise<Membership[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((row) => mapRow(row as MembershipRow)));
  }

  async create(input: CreateMembershipInput): Promise<Membership> {
    const roleKey = await resolveRoleKey(input.roleId);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .insert({
        user_id: input.userId,
        organization_id: input.organizationId,
        workspace_id: input.workspaceId ?? null,
        role_key: roleKey,
        scope: input.scope,
        status: input.status ?? "active",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data as MembershipRow);
  }

  async update(id: MembershipId, input: UpdateMembershipInput): Promise<Membership> {
    const payload: {
      status?: string;
      role_key?: string;
    } = {};
    if (input.status) payload.status = input.status;
    if (input.roleId) {
      payload.role_key = await resolveRoleKey(input.roleId);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("memberships")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data as MembershipRow);
  }

  async delete(id: MembershipId): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("memberships").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export const membershipRepository = new SupabaseMembershipRepository();
