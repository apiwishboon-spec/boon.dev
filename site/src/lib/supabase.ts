import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url: string | undefined = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey: string | undefined = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** Return a configured Supabase client, or null when env vars are absent. */
export function getClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

/** True when Supabase is configured (env vars set). */
export function isConfigured(): boolean {
  return Boolean(url && anonKey);
}
