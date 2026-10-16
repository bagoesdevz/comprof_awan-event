import "server-only";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { contentChannel, contentChanged, hasContentChanges } from "@/lib/platform-sync";

export async function notifyContentChanges(changes: Array<{ collection: string }>) {
  if (!hasContentChanges(changes)) return;
  const client = getServiceSupabaseClient();
  let channel: ReturnType<typeof client.channel> | undefined;
  try {
    channel = client.channel(contentChannel);
    await channel.send({ type: "broadcast", event: contentChanged, payload: {} }, { timeout: 1500 });
  } catch {
    // Saving already succeeded; visible pages also refresh on reconnect and every 15 seconds.
  } finally {
    if (channel) await client.removeChannel(channel).catch(() => {});
  }
}
