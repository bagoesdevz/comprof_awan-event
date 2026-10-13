import {PublicShell} from "@/components/site/public-shell";
import {Articles} from "@/components/site/articles";
export default async function Page({params}:{params: Promise<{slug:string}>}){const route=await params;return <PublicShell><section className="brand-container py-12"><Articles slug={route.slug}/></section></PublicShell>;}
