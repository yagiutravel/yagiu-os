import type { Permission, PermissionKey, TenantContext } from "@/tenant/types";

export interface PermissionCheckOptions {
  requireAll?: boolean;
}

export interface IPermissionEngine {
  hasPermission(
    context: TenantContext,
    permissionKey: PermissionKey | string,
  ): Promise<boolean>;
  hasAnyPermission(
    context: TenantContext,
    permissionKeys: Array<PermissionKey | string>,
  ): Promise<boolean>;
  hasAllPermissions(
    context: TenantContext,
    permissionKeys: Array<PermissionKey | string>,
  ): Promise<boolean>;
  resolveEffectivePermissions(context: TenantContext): Promise<Permission[]>;
}
