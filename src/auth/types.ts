import type { Session, User } from "@supabase/supabase-js";
import type { TenantContext } from "@/tenant/types";

export type UserProfile = {
  id: string;
  organizationId: string;
  workspaceId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  jobTitle: string;
  phone: string;
  preferences: Record<string, unknown>;
};

export type AuthMembership = {
  id: string;
  roleKey: string;
  scope: "organization" | "workspace";
  status: string;
};

export type AuthSessionState = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  membership: AuthMembership | null;
  tenantContext: TenantContext | null;
  isLoading: boolean;
};

export type AuthAuditEventType =
  | "login"
  | "logout"
  | "password_reset_request"
  | "password_reset_complete"
  | "session_refresh";
