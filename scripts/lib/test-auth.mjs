/**
 * Autentica il client Supabase per smoke test con RLS.
 * Richiede TEST_USER_EMAIL e TEST_USER_PASSWORD in .env.local
 */
export async function signInTestUser(supabase) {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL e TEST_USER_PASSWORD richiesti in .env.local per i test con RLS",
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Login test user fallito: ${error.message}`);
  }

  return data.session;
}

export async function signOutTestUser(supabase) {
  await supabase.auth.signOut();
}
