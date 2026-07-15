/**
 * Bootstrap Sprint 3 su Supabase remoto.
 * Usage: node --env-file=.env.local scripts/bootstrap-sprint3.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { ensureTestUser } from "./lib/ensure-test-user.mjs";
import {
  applySprint3MigrationIfNeeded,
  grantSprint3Tables,
  listExistingSprint3Tables,
  reloadPostgrestSchema,
  resolveDatabaseUrl,
  withDatabaseClient,
} from "./lib/supabase-db.mjs";

const SPRINT_3_TABLES = [
  "workspaces",
  "user_profiles",
  "memberships",
  "auth_audit_events",
];

function ok(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

async function waitForPostgrestTables(url, anonKey, attempts = 12) {
  const supabase = createClient(url, anonKey);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const results = await Promise.all(
      SPRINT_3_TABLES.map(async (table) => {
        const { error } = await supabase.from(table).select("id").limit(1);
        return { table, missing: error?.code === "PGRST205" };
      }),
    );

    const missing = results.filter((item) => item.missing).map((item) => item.table);
    if (missing.length === 0) {
      ok("PostgREST espone le tabelle Sprint 3");
      return;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      fail(
        `PostgREST non vede ancora: ${missing.join(", ")}. Verifica NOTIFY pgrst o riapplica la migration.`,
      );
    }
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    fail("NEXT_PUBLIC_SUPABASE_URL/ANON_KEY mancanti in .env.local");
  }

  if (!resolveDatabaseUrl()) {
    fail(
      "Aggiungi in .env.local una di queste variabili:\n" +
        "  SUPABASE_DB_URL=postgresql://...\n" +
        "  oppure SUPABASE_DB_PASSWORD=<database password>",
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    fail(
      "SUPABASE_SERVICE_ROLE_KEY mancante in .env.local (richiesta per creare l'utente di test via Admin API)",
    );
  }

  console.log("🔧 Bootstrap Sprint 3...");

  await withDatabaseClient(async (client) => {
    const before = await listExistingSprint3Tables(client);
    console.log(`   Tabelle Sprint 3 nel DB: ${before.length}/${SPRINT_3_TABLES.length}`);

    const migration = await applySprint3MigrationIfNeeded(client);
    if (migration.applied) {
      ok(`Migration Sprint 3 applicata (mancavano: ${migration.missing.join(", ")})`);
    } else {
      ok("Migration Sprint 3 già presente nel database");
    }

    await grantSprint3Tables(client);
    ok("Grant API applicati sulle tabelle Sprint 3");

    await reloadPostgrestSchema(client);
    ok("NOTIFY pgrst inviato");
  });

  await waitForPostgrestTables(url, anonKey);

  const user = await ensureTestUser();
  ok(
    user.created
      ? `Utente di test creato (${user.email})`
      : `Utente di test già presente (${user.email})`,
  );
  ok(".env.local aggiornato con TEST_USER_EMAIL / TEST_USER_PASSWORD");

  console.log("\n✅ Bootstrap Sprint 3 completato.");
}

main().catch((error) => fail(error.message));
