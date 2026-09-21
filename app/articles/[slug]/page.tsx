import {PublicShell} from "@/components/site/public-shell";
import {Articles} from "@/components/site/articles";
export default function Page({params}:{params:{slug:string}}){return <PublicShell><section className="brand-container py-12"><Articles slug={params.slug}/></section></PublicShell>;}
