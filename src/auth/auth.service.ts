import { getSupabaseClient } from "@/config/supabase";
import type {
  AuthAuditEventType,
  AuthMembership,
  UserProfile,
} from "@/auth/types";
import type { TenantContext } from "@/tenant/types";
import type { Json } from "@/types/database";

type ProfileRow = {
  id: string;
  organization_id: string;
  workspace_id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  job_title: string;
  phone: string;
  preferences: Record<string, unknown> | null;
};

type MembershipRow = {
  id: string;
  role_key: string;
  scope: "organization" | "workspace";
  status: string;
};

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    organizationId: row.organization_id,
    workspaceId: row.workspace_id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    jobTitle: row.job_title,
    phone: row.phone,
    preferences: row.preferences ?? {},
  };
}

function mapMembershipRow(row: MembershipRow): AuthMembership {
  return {
    id: row.id,
    roleKey: row.role_key,
    scope: row.scope,
    status: row.status,
  };
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`Profilo utente: ${error.message}`);
  if (!data) return null;

  return mapProfileRow(data as ProfileRow);
}

export async function loadActiveMembership(
  userId: string,
  organizationId: string,
  workspaceId: string,
): Promise<AuthMembership | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("id, role_key, scope, status")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(`Membership: ${error.message}`);
  if (!data) return null;

  return mapMembershipRow(data as MembershipRow);
}

export function buildTenantContext(
  profile: UserProfile,
  membership: AuthMembership | null,
): TenantContext {
  return {
    organizationId: profile.organizationId,
    workspaceId: profile.workspaceId,
    userId: profile.id,
    membershipId: membership?.id,
  };
}

export async function recordAuthAuditEvent(input: {
  eventType: AuthAuditEventType;
  organizationId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("auth_audit_events").insert({
    organization_id: input.organizationId ?? null,
    user_id: input.userId ?? null,
    event_type: input.eventType,
    metadata: (input.metadata ?? {}) as Json,
  });

  if (error && error.code !== "PGRST205") {
    console.error("auth audit event failed:", error.message);
  }
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function requestPasswordReset(email: string) {
  const supabase = getSupabaseClient();
  const redirectTo = `${window.location.origin}/aggiorna-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo },
  );
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function updateUserProfile(
  userId: string,
  input: Partial<Pick<UserProfile, "displayName" | "jobTitle" | "phone" | "preferences">>,
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      display_name: input.displayName,
      job_title: input.jobTitle,
      phone: input.phone,
      preferences: input.preferences as Json | undefined,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapProfileRow(data as ProfileRow);
}

export async function updateUserEmail(newEmail: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    email: newEmail.trim().toLowerCase(),
  });
  if (error) throw new Error(error.message);
}
