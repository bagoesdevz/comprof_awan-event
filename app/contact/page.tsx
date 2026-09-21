import { PublicShell,PublicPageHero } from "@/components/site/public-shell";
import { LeadForm } from "@/components/site/lead-form";
export default function Page(){return <PublicShell><PublicPageHero title="Hubungi kami"/><section className="brand-container grid gap-8 py-12 lg:grid-cols-[.7fr_1.3fr]"><aside><h2 className="text-xl font-semibold">Awan Event</h2><a href="mailto:halo@awanevent.id" className="mt-4 inline-block text-primary-700">halo@awanevent.id</a></aside><LeadForm kind="contact"/></section></PublicShell>;}
