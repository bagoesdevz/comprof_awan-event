import type { SupabaseClient } from "@supabase/supabase-js";

export const contentChannel = "awan-public-content";
export const contentChanged = "content-changed";
export const hasContentChanges = (changes: Array<{ collection: string }>) => changes.some(change => ["events", "cms", "articles"].includes(change.collection));

export function listenForContentChanges(client: SupabaseClient, refresh: () => Promise<unknown>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let local: BroadcastChannel | undefined;
  const queue = () => {
    if (disposed || document.visibilityState === "hidden" || navigator.onLine === false || timer) return;
    timer = setTimeout(() => { timer = undefined; void refresh(); }, 200);
  };
  const channel = client.channel(contentChannel).on("broadcast", { event: contentChanged }, queue).subscribe(status => {
    if (status === "SUBSCRIBED") queue();
  });
  try { local = new BroadcastChannel(contentChannel); local.onmessage = event => { if (event.data === contentChanged) queue(); }; } catch {}
  const fallback = setInterval(queue, 15000);
  document.addEventListener("visibilitychange", queue);
  window.addEventListener("online", queue);
  return {
    notify: () => { try { local?.postMessage(contentChanged); } catch {} },
    dispose: () => {
      disposed = true;
      clearTimeout(timer); clearInterval(fallback);
      document.removeEventListener("visibilitychange", queue);
      window.removeEventListener("online", queue);
      local?.close();
      void client.removeChannel(channel);
    },
  };
}
