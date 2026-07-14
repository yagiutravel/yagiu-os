import type { OrganizationId, WorkspaceId } from "./ids";

export interface Workspace {
  id: WorkspaceId;
  organizationId: OrganizationId;
  name: string;
  slug: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  organizationId: OrganizationId;
  name: string;
  slug: string;
  isDefault?: boolean;
}

export interface UpdateWorkspaceInput {
  name?: string;
  slug?: string;
  isDefault?: boolean;
}
