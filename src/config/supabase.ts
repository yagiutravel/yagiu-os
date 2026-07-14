import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type TypedSupabaseClient = SupabaseClient<Database>;

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase non configurato. Imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  return { url, anonKey };
}

let browserClient: TypedSupabaseClient | undefined;

/**
 * Returns a singleton Supabase client for browser/client-side usage.
 * Throws only when invoked without the required env variables.
 */
export function getSupabaseClient(): TypedSupabaseClient {
  if (browserClient) return browserClient;

  const { url, anonKey } = getSupabaseConfig();

  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

/**
 * Creates a new Supabase client instance.
 * Useful for server-side contexts where a fresh instance is preferred.
 */
export function createSupabaseClient(): TypedSupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient<Database>(url, anonKey);
}
