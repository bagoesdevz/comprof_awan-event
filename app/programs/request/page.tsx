import { PublicShell,PublicPageHero } from "@/components/site/public-shell";
import { LeadForm } from "@/components/site/lead-form";
export default function Page(){return <PublicShell><PublicPageHero title="Ajukan program"/><section className="brand-container max-w-3xl py-12"><LeadForm kind="program"/></section></PublicShell>;}
