import type { Role } from "@/tenant/types";

const roleByKey = new Map<string, Role>();
const roleById = new Map<string, Role>();

export function hydrateRoleCatalog(roles: Role[]): void {
  roleByKey.clear();
  roleById.clear();
  for (const role of roles) {
    roleByKey.set(role.key, role);
    roleById.set(role.id, role);
  }
}

export const ROLE_BY_KEY = roleByKey;
export const ROLE_BY_ID = roleById;
