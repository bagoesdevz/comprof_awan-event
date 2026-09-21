import {PublicShell,PublicPageHero} from "@/components/site/public-shell";
import {Articles} from "@/components/site/articles";
export default function Page(){return <PublicShell><PublicPageHero title="Artikel"/><section className="brand-container py-12"><Articles/></section></PublicShell>;}
