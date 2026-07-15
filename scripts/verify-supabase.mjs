/**
 * Verifica la connessione a Supabase e le tabelle Sprint 1A.
 * Usage: npm run supabase:verify
 */
import { createClient } from "@supabase/supabase-js";

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

  const { error: clientiError } = await supabase
    .from("clienti")
    .select("id")
    .limit(1);

  if (clientiError) {
    if (
      clientiError.code === "PGRST205" ||
      clientiError.message.includes("Could not find the table")
    ) {
      console.log("⚠️  Tabella clienti non trovata — esegui supabase/schema.sql");
    } else {
      console.error("❌ Errore query clienti:", clientiError.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Tabella clienti accessibile.");
  }

  let missing = 0;
  for (const table of [...SPRINT_1A_TABLES, ...SPRINT_1B_TABLES]) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message.includes("Could not find the table")
      ) {
        console.log(`⚠️  Tabella ${table} non trovata`);
        missing += 1;
      } else {
        console.error(`❌ Errore su ${table}:`, error.message);
        process.exit(1);
      }
    } else {
      console.log(`✅ Tabella ${table} accessibile.`);
    }
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

  console.log("✅ Sprint 1A + 1B — tutte le tabelle tour sono accessibili.");
  process.exit(0);
}

verifySupabaseConnection();
