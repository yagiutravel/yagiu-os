import type {
  CreateWorkspaceInput,
  OrganizationId,
  UpdateWorkspaceInput,
  Workspace,
  WorkspaceId,
} from "@/tenant/types";

export interface IWorkspaceRepository {
  findById(id: WorkspaceId): Promise<Workspace | null>;
  findBySlug(
    organizationId: OrganizationId,
    slug: string,
  ): Promise<Workspace | null>;
  listByOrganization(organizationId: OrganizationId): Promise<Workspace[]>;
  findDefaultByOrganization(
    organizationId: OrganizationId,
  ): Promise<Workspace | null>;
  create(input: CreateWorkspaceInput): Promise<Workspace>;
  update(id: WorkspaceId, input: UpdateWorkspaceInput): Promise<Workspace>;
  delete(id: WorkspaceId): Promise<void>;
}
