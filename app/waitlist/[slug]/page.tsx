import { PublicShell,PublicPageHero } from "@/components/site/public-shell";
import { LeadForm } from "@/components/site/lead-form";
export default function Page({params}:{params:{slug:string}}){return <PublicShell><PublicPageHero title="Daftar tunggu"/><section className="brand-container max-w-3xl py-12"><LeadForm kind="waitlist" eventSlug={params.slug}/></section></PublicShell>;}
