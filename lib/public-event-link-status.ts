import type { SupabaseClient } from "@supabase/supabase-js";
import { isEventPublicCode } from "./event-sharing";

export async function publicEventLinkStatus(client: SupabaseClient, code: string): Promise<200 | 404 | 503> {
  if (!isEventPublicCode(code)) return 404;
  try {
    const { data, error } = await client.from("platform_records").select("id")
      .eq("collection", "events").eq("published", true)
      .eq("data->>publication", "published").eq("data->>publicCode", code).maybeSingle();
    return error ? 503 : data ? 200 : 404;
  } catch { return 503; }
}
