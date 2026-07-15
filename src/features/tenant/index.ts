/**
 * Tenant feature module — API pubblica multi-tenant.
 */
export {
  type Organization,
  type Workspace,
  type Membership,
  type Role,
  type Permission,
  type TenantContext,
  type TenantScope,
  type PermissionKey,
  organizationService,
  workspaceService,
  membershipService,
  roleService,
  permissionService,
  permissionEngine,
  roleEngine,
  tenantContextProvider,
} from "@/tenant";
