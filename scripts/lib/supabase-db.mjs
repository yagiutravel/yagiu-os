import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const { Client } = pg;

const SPRINT_3_TABLES = [
  "workspaces",
  "user_profiles",
  "memberships",
  "auth_audit_events",
];

export function extractProjectRef(supabaseUrl) {
  const match = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

export function resolveDatabaseUrl(env = process.env) {
  if (env.SUPABASE_DB_URL) return env.SUPABASE_DB_URL;
  if (env.DATABASE_URL) return env.DATABASE_URL;

  const password = env.SUPABASE_DB_PASSWORD;
  const ref =
    env.SUPABASE_PROJECT_REF ?? extractProjectRef(env.NEXT_PUBLIC_SUPABASE_URL);

  if (!password || !ref) return null;

  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;
}

export async function withDatabaseClient(callback) {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "SUPABASE_DB_URL o SUPABASE_DB_PASSWORD mancante in .env.local",
    );
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

export async function listExistingSprint3Tables(client) {
  const { rows } = await client.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [SPRINT_3_TABLES],
  );
  return rows.map((row) => row.table_name);
}

export async function applySprint3MigrationIfNeeded(client) {
  const existing = await listExistingSprint3Tables(client);
  const missing = SPRINT_3_TABLES.filter((table) => !existing.includes(table));

  if (missing.length === 0) {
    return { applied: false, missing: [] };
  }

  const migrationPath = join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260715300000_sprint_3_auth_multi_tenant.sql",
  );
  const sql = readFileSync(migrationPath, "utf8");
  await client.query(sql);

  return { applied: true, missing };
}

export async function reloadPostgrestSchema(client) {
  await client.query(`NOTIFY pgrst, 'reload schema'`);
}

export async function grantSprint3Tables(client) {
  for (const table of SPRINT_3_TABLES) {
    await client.query(
      `GRANT ALL ON TABLE public.${table} TO anon, authenticated, service_role`,
    );
  }
}
