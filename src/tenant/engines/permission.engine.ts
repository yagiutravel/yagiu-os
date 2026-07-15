import type {
  IMembershipRepository,
  IPermissionEngine,
  IPermissionRepository,
  IRoleRepository,
} from "@/tenant/interfaces";
import {
  membershipRepository,
  permissionRepository,
  roleRepository,
} from "../repositories";
import type { Membership, Permission, PermissionKey, TenantContext } from "@/tenant/types";

export class PermissionEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionEngineError";
  }
}

export class PermissionEngine implements IPermissionEngine {
  constructor(
    private readonly membershipRepo: IMembershipRepository = membershipRepository,
    private readonly roleRepo: IRoleRepository = roleRepository,
    private readonly permissionRepo: IPermissionRepository = permissionRepository,
  ) {}

  async hasPermission(
    context: TenantContext,
    permissionKey: PermissionKey | string,
  ): Promise<boolean> {
    const effective = await this.resolveEffectivePermissions(context);
    const normalized = permissionKey.trim().toLowerCase();
    return effective.some((permission) => permission.key === normalized);
  }

  async hasAnyPermission(
    context: TenantContext,
    permissionKeys: Array<PermissionKey | string>,
  ): Promise<boolean> {
    if (permissionKeys.length === 0) return false;

    const effective = await this.resolveEffectivePermissions(context);
    const normalized = new Set(
      permissionKeys.map((key) => key.trim().toLowerCase()),
    );

    return effective.some((permission) => normalized.has(permission.key));
  }

  async hasAllPermissions(
    context: TenantContext,
    permissionKeys: Array<PermissionKey | string>,
  ): Promise<boolean> {
    if (permissionKeys.length === 0) return true;

    const effective = await this.resolveEffectivePermissions(context);
    const effectiveKeys = new Set(effective.map((permission) => permission.key));
    const normalized = permissionKeys.map((key) => key.trim().toLowerCase());

    return normalized.every((key) => effectiveKeys.has(key));
  }

  async resolveEffectivePermissions(
    context: TenantContext,
  ): Promise<Permission[]> {
    if (!context.userId) {
      throw new PermissionEngineError(
        "Cannot resolve permissions without userId in tenant context",
      );
    }

    const memberships = await this.resolveRelevantMemberships(context);
    const permissionIds = new Set<string>();

    for (const membership of memberships) {
      if (membership.status !== "active") continue;

      const role =
        (await this.roleRepo.findById(membership.roleId)) ??
        (await this.roleRepo.findByKey(membership.roleId));
      if (!role) continue;

      for (const permissionId of role.permissionIds) {
        permissionIds.add(permissionId);
      }
    }

    return this.permissionRepo.listByIds([...permissionIds]);
  }

  private async resolveRelevantMemberships(
    context: TenantContext,
  ): Promise<Membership[]> {
    const memberships: Membership[] = [];

    const workspaceMembership = await this.membershipRepo.findByUserAndWorkspace(
      context.userId!,
      context.workspaceId,
    );
    if (workspaceMembership) {
      memberships.push(workspaceMembership);
    }

    const organizationMembership =
      await this.membershipRepo.findByUserAndOrganization(
        context.userId!,
        context.organizationId,
      );
    if (organizationMembership) {
      memberships.push(organizationMembership);
    }

    if (context.membershipId) {
      const explicit = await this.membershipRepo.findById(context.membershipId);
      if (
        explicit &&
        !memberships.some((membership) => membership.id === explicit.id)
      ) {
        memberships.push(explicit);
      }
    }

    return memberships;
  }
}

export const permissionEngine = new PermissionEngine();
