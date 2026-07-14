import type { ITenantContextProvider } from "@/tenant/interfaces";
import type { TenantContext } from "@/tenant/types";

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantContextError";
  }
}

export class TenantContextProvider implements ITenantContextProvider {
  private context: TenantContext | null = null;

  get(): TenantContext | null {
    return this.context ? { ...this.context } : null;
  }

  require(): TenantContext {
    if (!this.context) {
      throw new TenantContextError("Tenant context is not set");
    }
    return { ...this.context };
  }

  set(context: TenantContext): void {
    this.context = { ...context };
  }

  clear(): void {
    this.context = null;
  }

  isSet(): boolean {
    return this.context !== null;
  }
}

export const tenantContextProvider = new TenantContextProvider();
