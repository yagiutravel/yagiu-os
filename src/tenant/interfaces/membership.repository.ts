import type {
  CreateMembershipInput,
  Membership,
  MembershipId,
  OrganizationId,
  UpdateMembershipInput,
  UserId,
  WorkspaceId,
} from "@/tenant/types";

export interface IMembershipRepository {
  findById(id: MembershipId): Promise<Membership | null>;
  listByOrganization(organizationId: OrganizationId): Promise<Membership[]>;
  listByWorkspace(workspaceId: WorkspaceId): Promise<Membership[]>;
  findByUserAndOrganization(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<Membership | null>;
  findByUserAndWorkspace(
    userId: UserId,
    workspaceId: WorkspaceId,
  ): Promise<Membership | null>;
  listByUser(userId: UserId): Promise<Membership[]>;
  create(input: CreateMembershipInput): Promise<Membership>;
  update(id: MembershipId, input: UpdateMembershipInput): Promise<Membership>;
  delete(id: MembershipId): Promise<void>;
}
