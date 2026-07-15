import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { TypedSupabaseClient } from "@/config/supabase";

/**
 * Returns a singleton Supabase client for browser/client-side usage.
 * Uses @supabase/ssr createBrowserClient for cookie-based session sync.
 */
export function getSupabaseClient(): TypedSupabaseClient {
  return getBrowserSupabaseClient();
}

/**
 * Creates a new Supabase browser client instance.
 */
export function createSupabaseClient(): TypedSupabaseClient {
  return getBrowserSupabaseClient();
}

export type { TypedSupabaseClient } from "@/config/supabase";
