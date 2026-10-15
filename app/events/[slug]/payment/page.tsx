import { Checkout } from "@/components/platform/checkout";
import { PublicShell } from "@/components/site/public-shell";
import { EventGroupAccess } from "@/components/dashboard/event-group-access";

export default async function PaymentPage({params,searchParams}:{params: Promise<{slug:string}>;searchParams: Promise<{registration?:string}>}){
  const query=await searchParams;const route=await params;
  return <PublicShell><div className="px-4 py-14"><div className="mx-auto max-w-4xl"><Checkout slug={route.slug} registrationId={typeof query.registration==="string"?query.registration:undefined}/><EventGroupAccess slug={route.slug}/></div></div></PublicShell>;
}
