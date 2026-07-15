import { getSupabaseClient } from "@/config/supabase";
import type { IWorkspaceRepository } from "@/tenant/interfaces";
import type {
  CreateWorkspaceInput,
  OrganizationId,
  UpdateWorkspaceInput,
  Workspace,
  WorkspaceId,
} from "@/tenant/types";

type WorkspaceRow = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function mapRow(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    slug: row.slug,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseWorkspaceRepository implements IWorkspaceRepository {
  async findById(id: WorkspaceId): Promise<Workspace | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as WorkspaceRow) : null;
  }

  async findBySlug(
    organizationId: OrganizationId,
    slug: string,
  ): Promise<Workspace | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as WorkspaceRow) : null;
  }

  async listByOrganization(organizationId: OrganizationId): Promise<Workspace[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as WorkspaceRow));
  }

  async findDefaultByOrganization(
    organizationId: OrganizationId,
  ): Promise<Workspace | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_default", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as WorkspaceRow) : null;
  }

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        organization_id: input.organizationId,
        name: input.name,
        slug: input.slug,
        is_default: input.isDefault ?? false,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as WorkspaceRow);
  }

  async update(id: WorkspaceId, input: UpdateWorkspaceInput): Promise<Workspace> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("workspaces")
      .update({
        name: input.name,
        slug: input.slug,
        is_default: input.isDefault,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as WorkspaceRow);
  }

  async delete(id: WorkspaceId): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export const workspaceRepository = new SupabaseWorkspaceRepository();
