import type { TenantContext } from "@/tenant/types";

export interface ITenantContextProvider {
  get(): TenantContext | null;
  require(): TenantContext;
  set(context: TenantContext): void;
  clear(): void;
  isSet(): boolean;
}
