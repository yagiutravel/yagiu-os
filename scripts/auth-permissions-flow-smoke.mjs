/**
 * Smoke test risoluzione permessi da ruolo/membership (Sprint 5 catalogo DB).
 * Usage: node --env-file=.env.local scripts/auth-permissions-flow-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { signInTestUser, signOutTestUser } from "./lib/test-auth.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PERMISSIONS_MIGRATION =
  "supabase/migrations/20260715400000_sprint_5_roles_permissions.sql";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function isMissingTableError(error) {
  return (
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table")
  );
}

async function loadRoleByKey(supabase, roleKey) {
  const normalized = roleKey.trim().toLowerCase();
  const { data, error } = await supabase
    .from("roles")
    .select("id, key, name, scope, is_system")
    .eq("key", normalized)
    .maybeSingle();

  if (error) fail(`roles (${normalized}): ${error.message}`);
  if (!data) fail(`Ruolo "${normalized}" non trovato nel catalogo`);
  return data;
}

async function loadPermissionIdsForRole(supabase, roleId) {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);

  if (error) fail(`role_permissions (${roleId}): ${error.message}`);
  return (data ?? []).map((row) => row.permission_id);
}

async function loadPermissionsByIds(supabase, permissionIds) {
  if (permissionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("permissions")
    .select("id, key, resource, action, scope")
    .in("id", permissionIds);

  if (error) fail(`permissions: ${error.message}`);
  return data ?? [];
}

async function resolveEffectivePermissionKeys(supabase, userId, organizationId, workspaceId) {
  const permissionIds = new Set();

  const { data: workspaceMembership, error: wsError } = await supabase
    .from("memberships")
    .select("id, role_key, status, scope")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("scope", "workspace")
    .maybeSingle();

  if (wsError) fail(`membership workspace: ${wsError.message}`);

  const { data: orgMembership, error: orgError } = await supabase
    .from("memberships")
    .select("id, role_key, status, scope")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("scope", "organization")
    .maybeSingle();

  if (orgError) fail(`membership organization: ${orgError.message}`);

  const memberships = [workspaceMembership, orgMembership].filter(Boolean);

  for (const membership of memberships) {
    if (membership.status !== "active") continue;

    const role = await loadRoleByKey(supabase, membership.role_key);
    const rolePermissionIds = await loadPermissionIdsForRole(supabase, role.id);
    for (const permissionId of rolePermissionIds) {
      permissionIds.add(permissionId);
    }
  }

  const permissions = await loadPermissionsByIds(supabase, [...permissionIds]);
  return permissions.map((permission) => permission.key.trim().toLowerCase());
}

function hasPermission(effectiveKeys, permissionKey) {
  const normalized = permissionKey.trim().toLowerCase();
  return effectiveKeys.includes(normalized);
}

function hasAllPermissions(effectiveKeys, permissionKeys) {
  return permissionKeys.every((key) => hasPermission(effectiveKeys, key));
}

async function main() {
  if (!url || !anonKey) {
    fail("Variabili Supabase mancanti in .env.local");
  }

  const supabase = createClient(url, anonKey);
  const session = await signInTestUser(supabase);
  ok(`Sessione autenticata (${session.user.id})`);

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, organization_id, workspace_id, display_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError) fail(`profile: ${profileError.message}`);
  if (!profile?.organization_id || !profile?.workspace_id) {
    fail("Profilo senza organization_id/workspace_id");
  }
  ok(`Profilo caricato (${profile.display_name})`);

  const { error: permissionsProbeError } = await supabase
    .from("permissions")
    .select("id")
    .limit(1);

  if (permissionsProbeError) {
    if (isMissingTableError(permissionsProbeError)) {
      fail(
        `Tabella permissions non trovata. Esegui prima:\n  ${PERMISSIONS_MIGRATION}`,
      );
    }
    fail(`permissions probe: ${permissionsProbeError.message}`);
  }
  ok("Catalogo permissions accessibile");

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("id, role_key, status, scope")
    .eq("user_id", session.user.id)
    .eq("workspace_id", profile.workspace_id)
    .eq("scope", "workspace")
    .maybeSingle();

  if (membershipError) fail(`membership: ${membershipError.message}`);
  if (!membership || membership.status !== "active") {
    fail("Membership workspace attiva non trovata");
  }
  if (membership.role_key !== "workspace_admin") {
    fail(
      `Ruolo test atteso workspace_admin, trovato ${membership.role_key}`,
    );
  }
  ok(`Membership workspace verificata (${membership.role_key})`);

  const adminRole = await loadRoleByKey(supabase, membership.role_key);
  ok(`Ruolo catalogo risolto (${adminRole.key} → ${adminRole.id})`);

  const adminPermissionIds = await loadPermissionIdsForRole(
    supabase,
    adminRole.id,
  );
  if (adminPermissionIds.length === 0) {
    fail("role_permissions vuoto per workspace_admin");
  }
  ok(`role_permissions workspace_admin (${adminPermissionIds.length} voci)`);

  const effectiveKeys = await resolveEffectivePermissionKeys(
    supabase,
    session.user.id,
    profile.organization_id,
    profile.workspace_id,
  );

  if (effectiveKeys.length === 0) {
    fail("Nessun permesso effettivo risolto per l'utente di test");
  }
  ok(`Permessi effettivi risolti (${effectiveKeys.length} chiavi)`);

  const requiredKeys = [
    "clienti:read",
    "clienti:write",
    "tour:write",
    "settings:manage",
    "comunicazioni:write",
  ];
  if (!hasAllPermissions(effectiveKeys, requiredKeys)) {
    const missing = requiredKeys.filter(
      (key) => !hasPermission(effectiveKeys, key),
    );
    fail(`workspace_admin manca permessi: ${missing.join(", ")}`);
  }
  ok("workspace_admin ha permessi write attesi");

  if (hasPermission(effectiveKeys, "organization:manage")) {
    fail("workspace_admin non dovrebbe avere organization:manage");
  }
  ok("organization:manage assente su workspace_admin (corretto)");

  const viewerRole = await loadRoleByKey(supabase, "workspace_viewer");
  const viewerPermissionIds = await loadPermissionIdsForRole(
    supabase,
    viewerRole.id,
  );
  const viewerPermissions = await loadPermissionsByIds(
    supabase,
    viewerPermissionIds,
  );
  const viewerKeys = viewerPermissions.map((permission) =>
    permission.key.trim().toLowerCase(),
  );

  if (hasPermission(viewerKeys, "clienti:write")) {
    fail("workspace_viewer non dovrebbe avere clienti:write nel catalogo");
  }
  ok("workspace_viewer è read-only (senza clienti:write)");

  const { count: permissionCount, error: countError } = await supabase
    .from("permissions")
    .select("id", { count: "exact", head: true });

  if (countError) fail(`permissions count: ${countError.message}`);
  if ((permissionCount ?? 0) < 20) {
    fail(`Catalogo permissions troppo piccolo (${permissionCount ?? 0})`);
  }
  ok(`Catalogo permissions seed OK (${permissionCount} righe)`);

  await signOutTestUser(supabase);
  ok("Logout completato");

  console.log(
    "\n✅ Flusso Auth permessi smoke test completato con successo.",
  );
}

main().catch((error) => fail(error.message));
