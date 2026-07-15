import type { AuthSessionState } from "@/auth/types";
import { tenantContextProvider } from "@/tenant/context/tenant-context.provider";

let authState: AuthSessionState = {
  session: null,
  user: null,
  profile: null,
  membership: null,
  tenantContext: null,
  isLoading: true,
};

export function setAuthSessionState(state: AuthSessionState): void {
  authState = state;
  if (state.tenantContext) {
    tenantContextProvider.set(state.tenantContext);
  } else {
    tenantContextProvider.clear();
  }
}

export function getAuthSessionState(): AuthSessionState {
  return authState;
}

export function getAuthenticatedUserId(): string | null {
  return authState.user?.id ?? null;
}

export function getAuthenticatedUserLabel(): string {
  return (
    authState.profile?.displayName?.trim() ||
    authState.user?.email?.split("@")[0] ||
    "Utente"
  );
}

export function requireAuthenticatedUserId(): string {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    throw new Error("Utente non autenticato");
  }
  return userId;
}

export function getAuthenticatedOrganizationId(): string | null {
  return authState.tenantContext?.organizationId ?? null;
}

export function requireAuthenticatedOrganizationId(): string {
  const organizationId = getAuthenticatedOrganizationId();
  if (!organizationId) {
    throw new Error("Organizzazione non risolta per l'utente corrente");
  }
  return organizationId;
}
