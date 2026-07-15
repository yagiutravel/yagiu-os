import { getSupabaseClient } from "@/config/supabase";
import type { IOrganizationRepository } from "@/tenant/interfaces";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationId,
  UpdateOrganizationInput,
} from "@/tenant/types";

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function mapRow(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as Organization["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  async findById(id: OrganizationId): Promise<Organization | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as OrganizationRow) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as OrganizationRow) : null;
  }

  async list(): Promise<Organization[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("organizations").select("*");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as OrganizationRow));
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: input.name,
        slug: input.slug,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as OrganizationRow);
  }

  async update(id: OrganizationId, input: UpdateOrganizationInput): Promise<Organization> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .update({
        name: input.name,
        slug: input.slug,
        status: input.status,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as OrganizationRow);
  }

  async delete(id: OrganizationId): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("organizations").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export const organizationRepository = new SupabaseOrganizationRepository();
