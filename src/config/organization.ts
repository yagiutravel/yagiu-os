import { getAuthenticatedOrganizationId } from "@/auth/session-store";
import { getSupabaseClient } from "@/config/supabase";

export const DEFAULT_ORGANIZATION_ID =
  "00000000-0000-4000-8000-000000000001";

let cachedOrganizationId: string | undefined;

function getEnvOrganizationId(): string | undefined {
  return process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID?.trim() || undefined;
}

export async function getOrganizationId(): Promise<string> {
  const fromAuth = getAuthenticatedOrganizationId();
  if (fromAuth) return fromAuth;

  const fromEnv = getEnvOrganizationId();
  if (fromEnv) return fromEnv;

  if (cachedOrganizationId) return cachedOrganizationId;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Impossibile risolvere organization_id: ${error.message}`,
    );
  }

  if (data?.id) {
    cachedOrganizationId = data.id;
    return data.id;
  }

  return DEFAULT_ORGANIZATION_ID;
}

export function resetOrganizationCache(): void {
  cachedOrganizationId = undefined;
}
