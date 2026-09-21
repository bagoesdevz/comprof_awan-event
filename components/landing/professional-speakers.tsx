"use client";
import { usePlatform } from "@/components/platform/provider";
export function ProfessionalSpeakers(){
 const {state}=usePlatform();const speakers=state.events.filter(e=>e.publication==="published").flatMap(e=>e.speakers).filter((s,i,a)=>a.findIndex(x=>x.name===s.name)===i);
 if(!speakers.length)return null;
 return <section className="brand-section"><div className="brand-container"><h2 className="mb-8">Pemateri</h2><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{speakers.map(s=><article key={s.name} className="flex gap-4">{s.photo&&<img src={s.photo} alt={s.name} loading="lazy" width={80} height={96} className="h-24 w-20 rounded-xl object-cover"/>}<div><h3 className="text-lg font-semibold">{s.name}</h3><p className="mt-2 text-sm text-content-muted">{s.role}</p><p className="mt-1 text-sm">{s.organization}</p></div></article>)}</div></div></section>;
}
