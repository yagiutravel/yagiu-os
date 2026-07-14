import { createMembership } from "@/tenant/models";
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
import { DEFAULT_MEMBERSHIPS } from "@/tenant/mock/tenant.seed";

export class MembershipRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MembershipRepositoryError";
  }
}

export class MockMembershipRepository implements IMembershipRepository {
  private store = new Map<MembershipId, Membership>();

  constructor(seed = true) {
    if (seed) {
      for (const membership of DEFAULT_MEMBERSHIPS) {
        this.store.set(membership.id, { ...membership });
      }
    }
  }

  async findById(id: MembershipId): Promise<Membership | null> {
    const membership = this.store.get(id);
    return membership ? { ...membership } : null;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Membership[]> {
    return [...this.store.values()]
      .filter((membership) => membership.organizationId === organizationId)
      .map((membership) => ({ ...membership }));
  }

  async listByWorkspace(workspaceId: WorkspaceId): Promise<Membership[]> {
    return [...this.store.values()]
      .filter((membership) => membership.workspaceId === workspaceId)
      .map((membership) => ({ ...membership }));
  }

  async findByUserAndOrganization(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<Membership | null> {
    for (const membership of this.store.values()) {
      if (
        membership.userId === userId &&
        membership.organizationId === organizationId &&
        membership.scope === "organization"
      ) {
        return { ...membership };
      }
    }
    return null;
  }

  async findByUserAndWorkspace(
    userId: UserId,
    workspaceId: WorkspaceId,
  ): Promise<Membership | null> {
    for (const membership of this.store.values()) {
      if (
        membership.userId === userId &&
        membership.workspaceId === workspaceId &&
        membership.scope === "workspace"
      ) {
        return { ...membership };
      }
    }
    return null;
  }

  async listByUser(userId: UserId): Promise<Membership[]> {
    return [...this.store.values()]
      .filter((membership) => membership.userId === userId)
      .map((membership) => ({ ...membership }));
  }

  async create(input: CreateMembershipInput): Promise<Membership> {
    if (input.scope === "organization") {
      const existing = await this.findByUserAndOrganization(
        input.userId,
        input.organizationId,
      );
      if (existing) {
        throw new MembershipRepositoryError(
          "User already has an organization membership",
        );
      }
    }

    if (input.scope === "workspace" && input.workspaceId) {
      const existing = await this.findByUserAndWorkspace(
        input.userId,
        input.workspaceId,
      );
      if (existing) {
        throw new MembershipRepositoryError(
          "User already has a workspace membership",
        );
      }
    }

    const membership = createMembership(input);
    this.store.set(membership.id, membership);
    return { ...membership };
  }

  async update(
    id: MembershipId,
    input: UpdateMembershipInput,
  ): Promise<Membership> {
    const current = this.store.get(id);
    if (!current) {
      throw new MembershipRepositoryError(`Membership "${id}" not found`);
    }

    const updated: Membership = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: MembershipId): Promise<void> {
    if (!this.store.has(id)) {
      throw new MembershipRepositoryError(`Membership "${id}" not found`);
    }
    this.store.delete(id);
  }
}

export const membershipRepository = new MockMembershipRepository();
