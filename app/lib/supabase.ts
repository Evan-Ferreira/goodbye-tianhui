import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase env vars are present, so callers can skip gracefully. */
export function hasSupabaseEnv(): boolean {
  return Boolean(url && anonKey);
}

/**
 * Server-side Supabase client (anon key + Row Level Security). Only call after
 * checking `hasSupabaseEnv()`.
 */
export function createClient() {
  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createSupabaseClient(url, anonKey);
}
