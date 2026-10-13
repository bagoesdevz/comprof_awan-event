import { EventWizard } from "@/components/admin/event-wizard";
export default async function Page({params}:{params: Promise<{slug:string}>}){const route=await params;return <EventWizard initialSlug={route.slug}/>;}
