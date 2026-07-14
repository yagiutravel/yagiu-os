import type {
  Membership,
  Role,
  RoleId,
  RoleScope,
  TenantContext,
} from "@/tenant/types";

export interface RoleAssignmentInput {
  membershipId: string;
  roleId: RoleId;
}

export interface IRoleEngine {
  getRoleById(roleId: RoleId): Promise<Role | null>;
  getRolesForScope(scope: RoleScope): Promise<Role[]>;
  resolveMembershipRole(membership: Membership): Promise<Role | null>;
  isSystemRole(role: Role): boolean;
  canAssignRole(
    actorContext: TenantContext,
    targetRole: Role,
  ): Promise<boolean>;
  assignRole(input: RoleAssignmentInput): Promise<Membership>;
}
