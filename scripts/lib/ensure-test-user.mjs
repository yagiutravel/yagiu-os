import { createClient } from "@supabase/supabase-js";
import { upsertEnvLocal } from "./env-local.mjs";

export const DEFAULT_TEST_USER_EMAIL = "yagiu-os-smoke-test@yagiutravel.com";
export const DEFAULT_TEST_USER_PASSWORD = "YagiuSmokeTest_2026!";

function createAdminClient(url, serviceRoleKey) {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function createUserWithAdmin(adminClient, email, password) {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Smoke Test" },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("registered")) {
      return { alreadyExists: true };
    }
    throw new Error(`Creazione utente admin fallita: ${error.message}`);
  }

  return { alreadyExists: false, user: data.user };
}

export async function ensureTestUser(env = process.env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL/ANON_KEY mancanti in .env.local");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY mancante in .env.local (richiesta per creare l'utente di test via Admin API)",
    );
  }

  const email = env.TEST_USER_EMAIL ?? DEFAULT_TEST_USER_EMAIL;
  const password = env.TEST_USER_PASSWORD ?? DEFAULT_TEST_USER_PASSWORD;

  const supabase = createClient(url, anonKey);
  const adminClient = createAdminClient(url, serviceRoleKey);

  const existing = await supabase.auth.signInWithPassword({ email, password });
  if (!existing.error && existing.data.session) {
    upsertEnvLocal({
      TEST_USER_EMAIL: email,
      TEST_USER_PASSWORD: password,
    });
    return { email, created: false, session: existing.data.session };
  }

  const created = await createUserWithAdmin(adminClient, email, password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(
      `Login test user fallito: ${error?.message ?? "sessione assente"}`,
    );
  }

  upsertEnvLocal({
    TEST_USER_EMAIL: email,
    TEST_USER_PASSWORD: password,
  });

  return {
    email,
    created: !created.alreadyExists,
    session: data.session,
  };
}

export async function signInTestUser(supabase, env = process.env) {
  const email = env.TEST_USER_EMAIL ?? DEFAULT_TEST_USER_EMAIL;
  const password = env.TEST_USER_PASSWORD ?? DEFAULT_TEST_USER_PASSWORD;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(
      `Login test user fallito: ${error?.message ?? "sessione assente"}`,
    );
  }

  return data.session;
}

export async function signOutTestUser(supabase) {
  await supabase.auth.signOut();
}
