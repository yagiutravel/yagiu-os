/**
 * Verifica la connessione a Supabase.
 * Usage: npm run supabase:verify
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

  const { error: tableError } = await supabase
    .from("clienti")
    .select("id")
    .limit(1);

  if (!tableError) {
    console.log("✅ Connessione OK — tabella clienti trovata e accessibile.");
    process.exit(0);
  }

  if (
    tableError.code === "PGRST205" ||
    tableError.message.includes("Could not find the table")
  ) {
    console.log("✅ Connessione OK — tabella clienti non ancora creata.");
    console.log("   Esegui supabase/schema.sql dalla SQL Editor di Supabase.");
    process.exit(0);
  }

  console.error("❌ Errore query clienti:", tableError.message);
  if (tableError.code) console.error(`   Codice: ${tableError.code}`);
  process.exit(1);
}

verifySupabaseConnection();
