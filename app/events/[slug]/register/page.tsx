import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { PublicPageHero, PublicShell } from "@/components/site/public-shell";
export default function RegistrationPage({params,searchParams}:{params:{slug:string};searchParams:{ticket?:string}}){return <PublicShell><PublicPageHero eyebrow="Pendaftaran event" title="Pendaftaran event"/><section className="mx-auto max-w-4xl px-4 py-14"><RegistrationWizard eventSlug={params.slug} ticketId={typeof searchParams.ticket==="string"?searchParams.ticket:""}/></section></PublicShell>;}
