/**
 * Applica le migration SQL su Supabase (richiede connessione Postgres diretta).
 *
 * Usage:
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" \
 *     npm run supabase:apply-migrations
 *
 * Oppure imposta SUPABASE_DB_URL in .env.local (non committare).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const { Client } = pg;

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const migrationsDir = join(process.cwd(), "supabase", "migrations");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

async function main() {
  if (!dbUrl) {
    fail(
      "SUPABASE_DB_URL mancante. Ottienila da Supabase Dashboard → Settings → Database → Connection string (URI).",
    );
  }

  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    fail(`Nessuna migration in ${migrationsDir}`);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("🔌 Connessione al database...");
  await client.connect();
  console.log(`📦 ${files.length} migration da applicare`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`→ ${file}`);
    await client.query(sql);
    console.log(`  ✅ ${file}`);
  }

  await client.end();
  console.log("\n✅ Tutte le migration applicate.");
}

main().catch((error) => fail(error.message));
