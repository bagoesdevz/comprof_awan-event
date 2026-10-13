import { PublicShell,PublicPageHero } from "@/components/site/public-shell";
import { LeadForm } from "@/components/site/lead-form";
export default async function Page({params}:{params: Promise<{slug:string}>}){const route=await params;return <PublicShell><PublicPageHero title="Daftar tunggu"/><section className="brand-container max-w-3xl py-12"><LeadForm kind="waitlist" eventSlug={route.slug}/></section></PublicShell>;}
