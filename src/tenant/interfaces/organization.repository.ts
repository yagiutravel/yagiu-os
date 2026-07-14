import type {
  CreateOrganizationInput,
  Organization,
  OrganizationId,
  UpdateOrganizationInput,
} from "@/tenant/types";

export interface IOrganizationRepository {
  findById(id: OrganizationId): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  list(): Promise<Organization[]>;
  create(input: CreateOrganizationInput): Promise<Organization>;
  update(
    id: OrganizationId,
    input: UpdateOrganizationInput,
  ): Promise<Organization>;
  delete(id: OrganizationId): Promise<void>;
}
