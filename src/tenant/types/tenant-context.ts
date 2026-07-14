import type { MembershipId, OrganizationId, UserId, WorkspaceId } from "./ids";

export interface TenantContext {
  readonly organizationId: OrganizationId;
  readonly workspaceId: WorkspaceId;
  readonly userId?: UserId;
  readonly membershipId?: MembershipId;
}

export interface TenantScope {
  readonly organizationId: OrganizationId;
  readonly workspaceId?: WorkspaceId;
}
