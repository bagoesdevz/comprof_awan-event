import { notFound } from "next/navigation";
import { EventPresentation } from "@/components/platform/event-presentation";
import { PublicShell } from "@/components/site/public-shell";
import { findPublicEvent } from "@/lib/server/platform";
import { HttpError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let event;
  try { event = await findPublicEvent(code); }
  catch (error) { if (error instanceof HttpError && error.status === 404) notFound(); throw error; }
  return <PublicShell><EventPresentation slug={event.slug} /></PublicShell>;
}
