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
  getDefaultTenantContext,
  DEFAULT_ORGANIZATION_ID,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_USER_ID,
} from "@/tenant";
