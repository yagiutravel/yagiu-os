"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/config/supabase";
import {
  buildTenantContext,
  hydratePermissionCatalogFromDb,
  loadActiveMembership,
  loadUserProfile,
  recordAuthAuditEvent,
  signOut as authSignOut,
} from "@/auth/auth.service";
import { setAuthSessionState } from "@/auth/session-store";
import type { AuthSessionState } from "@/auth/types";
import { permissionEngine } from "@/tenant/engines/permission.engine";
import type { TenantContext } from "@/tenant/types";

type AuthContextValue = AuthSessionState & {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (permissionKey: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveAuthState(
  session: Session | null,
  user: User | null,
): Promise<Omit<AuthSessionState, "isLoading">> {
  if (!session || !user) {
    return {
      session: null,
      user: null,
      profile: null,
      membership: null,
      tenantContext: null,
    };
  }

  const profile = await loadUserProfile(user.id);
  if (!profile) {
    return {
      session,
      user,
      profile: null,
      membership: null,
      tenantContext: null,
    };
  }

  const membership = await loadActiveMembership(
    user.id,
    profile.organizationId,
    profile.workspaceId,
  );

  await hydratePermissionCatalogFromDb();

  const tenantContext = buildTenantContext(profile, membership);

  return {
    session,
    user,
    profile,
    membership,
    tenantContext,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthSessionState>({
    session: null,
    user: null,
    profile: null,
    membership: null,
    tenantContext: null,
    isLoading: true,
  });

  const applyState = useCallback((next: AuthSessionState) => {
    setState(next);
    setAuthSessionState(next);
  }, []);

  const refreshProfile = useCallback(async () => {
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    const resolved = await resolveAuthState(session, user);
    applyState({ ...resolved, isLoading: false });
  }, [applyState]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const resolved = await resolveAuthState(session, session?.user ?? null);
      if (mounted) {
        applyState({ ...resolved, isLoading: false });
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const resolved = await resolveAuthState(session, session?.user ?? null);
      applyState({ ...resolved, isLoading: false });

      if (event === "SIGNED_IN" && session?.user) {
        await recordAuthAuditEvent({
          eventType: "login",
          organizationId: resolved.profile?.organizationId,
          userId: session.user.id,
        });
      }

      if (event === "SIGNED_OUT") {
        await recordAuthAuditEvent({
          eventType: "logout",
          userId: null,
        });
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        await recordAuthAuditEvent({
          eventType: "session_refresh",
          organizationId: resolved.profile?.organizationId,
          userId: session.user.id,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyState]);

  const signOut = useCallback(async () => {
    const organizationId = state.profile?.organizationId;
    const userId = state.user?.id;
    await authSignOut();
    applyState({
      session: null,
      user: null,
      profile: null,
      membership: null,
      tenantContext: null,
      isLoading: false,
    });
    await recordAuthAuditEvent({
      eventType: "logout",
      organizationId,
      userId,
    });
  }, [applyState, state.profile?.organizationId, state.user?.id]);

  const hasPermission = useCallback(
    async (permissionKey: string) => {
      if (!state.tenantContext?.userId) return false;
      return permissionEngine.hasPermission(state.tenantContext, permissionKey);
    },
    [state.tenantContext],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signOut,
      refreshProfile,
      hasPermission,
    }),
    [state, signOut, refreshProfile, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }
  return context;
}

export function useTenantContext(): TenantContext | null {
  return useAuth().tenantContext;
}

export function useRequireTenantContext(): TenantContext {
  const context = useAuth().tenantContext;
  if (!context) {
    throw new Error("Tenant context non disponibile");
  }
  return context;
}
