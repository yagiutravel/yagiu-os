import type {
  IMembershipRepository,
  IPermissionEngine,
  IRoleEngine,
  IRoleRepository,
  RoleAssignmentInput,
} from "@/tenant/interfaces";
import {
  membershipRepository,
  roleRepository,
} from "../repositories";
import { permissionEngine } from "./permission.engine";
import type {
  Membership,
  Role,
  RoleId,
  RoleScope,
  TenantContext,
} from "@/tenant/types";

export class RoleEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleEngineError";
  }
}

const ROLE_ASSIGNMENT_PERMISSIONS: Record<RoleScope, string> = {
  organization: "membership:manage",
  workspace: "workspace:manage",
  system: "organization:manage",
};

export class RoleEngine implements IRoleEngine {
  constructor(
    private readonly roleRepo: IRoleRepository = roleRepository,
    private readonly membershipRepo: IMembershipRepository = membershipRepository,
    private readonly permissionEngine: IPermissionEngine,
  ) {}

  async getRoleById(roleId: RoleId): Promise<Role | null> {
    return this.roleRepo.findById(roleId);
  }

  async getRolesForScope(scope: RoleScope): Promise<Role[]> {
    return this.roleRepo.listByScope(scope);
  }

  async resolveMembershipRole(membership: Membership): Promise<Role | null> {
    return this.roleRepo.findById(membership.roleId);
  }

  isSystemRole(role: Role): boolean {
    return role.isSystem;
  }

  async canAssignRole(
    actorContext: TenantContext,
    targetRole: Role,
  ): Promise<boolean> {
    const requiredPermission = ROLE_ASSIGNMENT_PERMISSIONS[targetRole.scope];
    return this.permissionEngine.hasPermission(actorContext, requiredPermission);
  }

  async assignRole(input: RoleAssignmentInput): Promise<Membership> {
    const membership = await this.membershipRepo.findById(input.membershipId);
    if (!membership) {
      throw new RoleEngineError(`Membership "${input.membershipId}" not found`);
    }

    const role = await this.roleRepo.findById(input.roleId);
    if (!role) {
      throw new RoleEngineError(`Role "${input.roleId}" not found`);
    }

    this.assertRoleCompatibleWithMembership(role, membership);

    return this.membershipRepo.update(input.membershipId, {
      roleId: input.roleId,
    });
  }

  private assertRoleCompatibleWithMembership(
    role: Role,
    membership: Membership,
  ): void {
    if (membership.scope === "organization" && role.scope !== "organization") {
      throw new RoleEngineError(
        "Organization memberships require organization-scoped roles",
      );
    }

    if (membership.scope === "workspace" && role.scope !== "workspace") {
      throw new RoleEngineError(
        "Workspace memberships require workspace-scoped roles",
      );
    }

    if (
      role.organizationId &&
      role.organizationId !== membership.organizationId
    ) {
      throw new RoleEngineError(
        "Role does not belong to the membership organization",
      );
    }
  }
}

export const roleEngine = new RoleEngine(
  roleRepository,
  membershipRepository,
  permissionEngine,
);
