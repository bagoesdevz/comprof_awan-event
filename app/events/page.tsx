import { EventsBrowser } from "@/components/events/events-browser";
import { PublicShell,PublicPageHero } from "@/components/site/public-shell";
export default function Page(){return <PublicShell><PublicPageHero title="Jadwal event"/><section className="brand-container py-10 lg:py-16"><EventsBrowser/></section></PublicShell>;}
