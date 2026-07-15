/**
 * Verifica la connessione a Supabase e le tabelle applicative.
 * Usage: npm run supabase:verify
 */
import { createClient } from "@supabase/supabase-js";
import { signInTestUser, signOutTestUser } from "./lib/test-auth.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SPRINT_1A_TABLES = [
  "organizations",
  "tours",
  "tour_staff",
  "tour_hotels",
  "tour_rooms",
  "room_assignments",
  "tour_participants",
  "tour_payments",
  "tour_checklist_templates",
  "tour_checklist_completions",
  "tour_documents",
  "tour_timeline_events",
];

const SPRINT_1B_TABLES = [
  "tour_program_days",
  "tour_program_activities",
  "tour_flights",
  "tour_transfers",
  "tour_insurances",
];

const SPRINT_2_TABLES = ["preventivi", "preventivo_righe"];

const SPRINT_3_TABLES = [
  "workspaces",
  "user_profiles",
  "memberships",
  "auth_audit_events",
];

function isMissingTable(error) {
  return (
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table")
  );
}

async function verifySupabaseConnection() {
  if (!url || !anonKey) {
    console.error("❌ Variabili mancanti in .env.local:");
    if (!url) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    if (!anonKey) console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  console.log("🔌 Verifica connessione Supabase...");
  console.log(`   URL: ${url}`);

  const supabase = createClient(url, anonKey);

  const { error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error("❌ Connessione fallita (auth):", authError.message);
    process.exit(1);
  }

  let missing = 0;
  let missingSprint3 = 0;

  for (const table of [
    ...SPRINT_1A_TABLES,
    ...SPRINT_1B_TABLES,
    ...SPRINT_2_TABLES,
    ...SPRINT_3_TABLES,
  ]) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      if (isMissingTable(error)) {
        console.log(`⚠️  Tabella ${table} non trovata nell'API`);
        missing += 1;
        if (SPRINT_3_TABLES.includes(table)) missingSprint3 += 1;
      } else {
        console.error(`❌ Errore su ${table}:`, error.message);
        process.exit(1);
      }
    } else {
      console.log(`✅ Tabella ${table} accessibile.`);
    }
  }

  if (missingSprint3 > 0) {
    console.log("");
    console.log("Sprint 3: tabelle auth/tenant non visibili in PostgREST.");
    console.log("Se hai già eseguito la migration, in SQL Editor lancia:");
    console.log("  NOTIFY pgrst, 'reload schema';");
    console.log("Altrimenti riesegui:");
    console.log("  supabase/migrations/20260715300000_sprint_3_auth_multi_tenant.sql");
    process.exit(1);
  }

  if (missing > 0) {
    console.log(
      "Esegui le migration in supabase/migrations/ dalla SQL Editor, oppure:",
    );
    console.log(
      "  npm run supabase:apply-migrations  (con SUPABASE_DB_URL in .env.local)",
    );
    process.exit(1);
  }

  try {
    await signInTestUser(supabase);
    console.log("✅ Autenticazione test user OK.");
  } catch (error) {
    console.error("❌", error instanceof Error ? error.message : error);
    console.error(
      "   Imposta TEST_USER_EMAIL e TEST_USER_PASSWORD in .env.local",
    );
    process.exit(1);
  }

  const { error: clientiError } = await supabase
    .from("clienti")
    .select("id")
    .limit(1);

  if (clientiError) {
    console.error("❌ Errore query clienti (autenticato):", clientiError.message);
    process.exit(1);
  }

  console.log("✅ Tabella clienti accessibile (autenticato).");
  await signOutTestUser(supabase);

  console.log(
    "✅ Sprint 1A + 1B + 2 + 3 — tutte le tabelle applicative sono accessibili.",
  );
  process.exit(0);
}

verifySupabaseConnection();
