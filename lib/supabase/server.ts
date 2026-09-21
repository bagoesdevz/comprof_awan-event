import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Konfigurasi Supabase untuk server belum lengkap.");
    this.name = "SupabaseConfigurationError";
  }
}

let publicClient: SupabaseClient<Database> | undefined;
let serviceClient: SupabaseClient<Database> | undefined;

export function getPublicSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new SupabaseConfigurationError();
  }

  publicClient ??= createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: { "X-Client-Info": "awan-event-api" },
    },
  });

  return publicClient;
}

export function getServiceSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new SupabaseConfigurationError();
  }

  serviceClient ??= createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: { "X-Client-Info": "awan-event-api-service" },
    },
  });

  return serviceClient;
}
