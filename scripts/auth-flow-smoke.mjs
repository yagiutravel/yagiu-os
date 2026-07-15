/**
 * Smoke test autenticazione e multi-tenant.
 * Usage: node --env-file=.env.local scripts/auth-flow-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { signInTestUser, signOutTestUser } from "./lib/test-auth.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ ${message}`);
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
  if (!profile) fail("Profilo utente non trovato");
  ok(`Profilo caricato (${profile.display_name})`);

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("id, role_key, status")
    .eq("user_id", session.user.id)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (membershipError) fail(`membership: ${membershipError.message}`);
  if (!membership || membership.status !== "active") {
    fail("Membership attiva non trovata");
  }
  ok(`Membership verificata (${membership.role_key})`);

  const { error: anonClientiError } = await createClient(url, anonKey)
    .from("clienti")
    .insert({ nome: "RLS Probe", organization_id: profile.organization_id, email: "rls@test.local" });

  if (!anonClientiError) {
    fail("RLS clienti: insert anon non dovrebbe essere consentito");
  }
  ok("RLS clienti blocca scrittura anon");

  const { error: clientiError } = await supabase
    .from("clienti")
    .select("id")
    .eq("organization_id", profile.organization_id)
    .limit(1);

  if (clientiError) fail(`clienti autenticati: ${clientiError.message}`);
  ok("Accesso clienti autenticato OK");

  const { error: authAuditError } = await supabase.from("auth_audit_events").insert({
    organization_id: profile.organization_id,
    user_id: session.user.id,
    event_type: "login",
    metadata: { source: "auth-flow-smoke" },
  });

  if (authAuditError) fail(`auth audit: ${authAuditError.message}`);
  ok("Auth audit event registrato");

  await signOutTestUser(supabase);
  ok("Logout completato");

  console.log("\n✅ Flusso Auth smoke test completato con successo.");
}

main().catch((error) => fail(error.message));
