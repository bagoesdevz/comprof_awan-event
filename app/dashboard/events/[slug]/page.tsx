import { ParticipantWorkspace } from "@/components/platform/participant-workspace";
import { EventGroupAccess } from "@/components/dashboard/event-group-access";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const route = await params;
  return <><ParticipantWorkspace slug={route.slug} /><EventGroupAccess slug={route.slug} /></>;
}
