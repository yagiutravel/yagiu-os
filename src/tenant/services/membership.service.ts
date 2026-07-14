import type { IMembershipRepository } from "@/tenant/interfaces";
import { membershipRepository } from "../repositories";
import type {
  CreateMembershipInput,
  Membership,
  MembershipId,
  TenantContext,
  UpdateMembershipInput,
  UserId,
  WorkspaceId,
} from "@/tenant/types";

export class MembershipServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MembershipServiceError";
  }
}

export class MembershipService {
  constructor(
    private readonly repository: IMembershipRepository = membershipRepository,
  ) {}

  async getById(id: MembershipId): Promise<Membership | null> {
    return this.repository.findById(id);
  }

  async listByOrganization(context: TenantContext): Promise<Membership[]> {
    return this.repository.listByOrganization(context.organizationId);
  }

  async listByWorkspace(workspaceId: WorkspaceId): Promise<Membership[]> {
    return this.repository.listByWorkspace(workspaceId);
  }

  async listByUser(userId: UserId): Promise<Membership[]> {
    return this.repository.listByUser(userId);
  }

  async resolveForContext(context: TenantContext): Promise<Membership | null> {
    if (!context.userId) return null;

    const workspaceMembership = await this.repository.findByUserAndWorkspace(
      context.userId,
      context.workspaceId,
    );
    if (workspaceMembership) return workspaceMembership;

    return this.repository.findByUserAndOrganization(
      context.userId,
      context.organizationId,
    );
  }

  async create(
    input: CreateMembershipInput,
    context?: TenantContext,
  ): Promise<Membership> {
    if (context && input.organizationId !== context.organizationId) {
      throw new MembershipServiceError(
        "Cannot create membership outside current organization",
      );
    }

    return this.repository.create(input);
  }

  async update(
    id: MembershipId,
    input: UpdateMembershipInput,
    context?: TenantContext,
  ): Promise<Membership> {
    if (context) {
      await this.assertMembershipInContext(id, context);
    }
    return this.repository.update(id, input);
  }

  async delete(id: MembershipId, context?: TenantContext): Promise<void> {
    if (context) {
      await this.assertMembershipInContext(id, context);
    }
    return this.repository.delete(id);
  }

  private async assertMembershipInContext(
    membershipId: MembershipId,
    context: TenantContext,
  ): Promise<void> {
    const membership = await this.repository.findById(membershipId);
    if (!membership) {
      throw new MembershipServiceError(`Membership "${membershipId}" not found`);
    }

    if (membership.organizationId !== context.organizationId) {
      throw new MembershipServiceError(
        "Membership does not belong to the current organization",
      );
    }
  }
}

export const membershipService = new MembershipService();
