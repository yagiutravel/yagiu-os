import type {
  MembershipId,
  OrganizationId,
  RoleId,
  UserId,
  WorkspaceId,
} from "./ids";

export type MembershipStatus = "active" | "invited" | "suspended";
export type MembershipScope = "organization" | "workspace";

export interface Membership {
  id: MembershipId;
  userId: UserId;
  organizationId: OrganizationId;
  workspaceId: WorkspaceId | null;
  roleId: RoleId;
  scope: MembershipScope;
  status: MembershipStatus;
  joinedAt: string;
  updatedAt: string;
}

export interface CreateMembershipInput {
  userId: UserId;
  organizationId: OrganizationId;
  workspaceId?: WorkspaceId | null;
  roleId: RoleId;
  scope: MembershipScope;
  status?: MembershipStatus;
}

export interface UpdateMembershipInput {
  roleId?: RoleId;
  status?: MembershipStatus;
}
