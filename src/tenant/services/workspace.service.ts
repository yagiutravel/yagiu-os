import type { IWorkspaceRepository } from "@/tenant/interfaces";
import { workspaceRepository } from "../repositories";
import type {
  CreateWorkspaceInput,
  OrganizationId,
  TenantContext,
  UpdateWorkspaceInput,
  Workspace,
  WorkspaceId,
} from "@/tenant/types";

export class WorkspaceServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceServiceError";
  }
}

export class WorkspaceService {
  constructor(
    private readonly repository: IWorkspaceRepository = workspaceRepository,
  ) {}

  async getById(id: WorkspaceId): Promise<Workspace | null> {
    return this.repository.findById(id);
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Workspace[]> {
    return this.repository.listByOrganization(organizationId);
  }

  async listForContext(context: TenantContext): Promise<Workspace[]> {
    return this.repository.listByOrganization(context.organizationId);
  }

  async getActiveForContext(context: TenantContext): Promise<Workspace | null> {
    return this.repository.findById(context.workspaceId);
  }

  async getDefaultForOrganization(
    organizationId: OrganizationId,
  ): Promise<Workspace | null> {
    return this.repository.findDefaultByOrganization(organizationId);
  }

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    return this.repository.create(input);
  }

  async update(
    id: WorkspaceId,
    input: UpdateWorkspaceInput,
    context?: TenantContext,
  ): Promise<Workspace> {
    if (context) {
      await this.assertWorkspaceInContext(id, context);
    }
    return this.repository.update(id, input);
  }

  async delete(id: WorkspaceId, context?: TenantContext): Promise<void> {
    if (context) {
      await this.assertWorkspaceInContext(id, context);
    }

    const workspace = await this.repository.findById(id);
    if (!workspace) {
      throw new WorkspaceServiceError(`Workspace "${id}" not found`);
    }

    return this.repository.delete(id);
  }

  private async assertWorkspaceInContext(
    workspaceId: WorkspaceId,
    context: TenantContext,
  ): Promise<void> {
    const workspace = await this.repository.findById(workspaceId);
    if (!workspace) {
      throw new WorkspaceServiceError(`Workspace "${workspaceId}" not found`);
    }

    if (workspace.organizationId !== context.organizationId) {
      throw new WorkspaceServiceError(
        "Workspace does not belong to the current organization",
      );
    }
  }
}

export const workspaceService = new WorkspaceService();
