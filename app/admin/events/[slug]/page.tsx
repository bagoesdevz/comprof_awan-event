import { EventWizard } from "@/components/admin/event-wizard";
export default function Page({params}:{params:{slug:string}}){return <EventWizard initialSlug={params.slug}/>;}
