import { createWorkspace } from "@/tenant/models";
import type { IWorkspaceRepository } from "@/tenant/interfaces";
import type {
  CreateWorkspaceInput,
  OrganizationId,
  UpdateWorkspaceInput,
  Workspace,
  WorkspaceId,
} from "@/tenant/types";
import { DEFAULT_WORKSPACE } from "@/tenant/mock/tenant.seed";

export class WorkspaceRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceRepositoryError";
  }
}

export class MockWorkspaceRepository implements IWorkspaceRepository {
  private store = new Map<WorkspaceId, Workspace>();

  constructor(seed = true) {
    if (seed) {
      this.store.set(DEFAULT_WORKSPACE.id, { ...DEFAULT_WORKSPACE });
    }
  }

  async findById(id: WorkspaceId): Promise<Workspace | null> {
    const workspace = this.store.get(id);
    return workspace ? { ...workspace } : null;
  }

  async findBySlug(
    organizationId: OrganizationId,
    slug: string,
  ): Promise<Workspace | null> {
    const normalized = slug.trim().toLowerCase();
    for (const workspace of this.store.values()) {
      if (
        workspace.organizationId === organizationId &&
        workspace.slug === normalized
      ) {
        return { ...workspace };
      }
    }
    return null;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Workspace[]> {
    return [...this.store.values()]
      .filter((workspace) => workspace.organizationId === organizationId)
      .map((workspace) => ({ ...workspace }));
  }

  async findDefaultByOrganization(
    organizationId: OrganizationId,
  ): Promise<Workspace | null> {
    const workspaces = await this.listByOrganization(organizationId);
    return workspaces.find((workspace) => workspace.isDefault) ?? null;
  }

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    const existing = await this.findBySlug(input.organizationId, input.slug);
    if (existing) {
      throw new WorkspaceRepositoryError(
        `Workspace slug "${input.slug}" already exists in organization`,
      );
    }

    if (input.isDefault) {
      for (const workspace of this.store.values()) {
        if (workspace.organizationId === input.organizationId) {
          workspace.isDefault = false;
        }
      }
    }

    const workspace = createWorkspace(input);
    this.store.set(workspace.id, workspace);
    return { ...workspace };
  }

  async update(
    id: WorkspaceId,
    input: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    const current = this.store.get(id);
    if (!current) {
      throw new WorkspaceRepositoryError(`Workspace "${id}" not found`);
    }

    if (input.slug && input.slug !== current.slug) {
      const existing = await this.findBySlug(
        current.organizationId,
        input.slug,
      );
      if (existing && existing.id !== id) {
        throw new WorkspaceRepositoryError(
          `Workspace slug "${input.slug}" already exists in organization`,
        );
      }
    }

    if (input.isDefault) {
      for (const workspace of this.store.values()) {
        if (workspace.organizationId === current.organizationId) {
          workspace.isDefault = workspace.id === id;
        }
      }
    }

    const updated: Workspace = {
      ...current,
      ...input,
      slug: input.slug?.trim().toLowerCase() ?? current.slug,
      name: input.name?.trim() ?? current.name,
      updatedAt: new Date().toISOString(),
    };

    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: WorkspaceId): Promise<void> {
    if (!this.store.has(id)) {
      throw new WorkspaceRepositoryError(`Workspace "${id}" not found`);
    }
    this.store.delete(id);
  }
}

export const workspaceRepository = new MockWorkspaceRepository();
