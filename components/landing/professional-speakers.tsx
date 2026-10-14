"use client";
import { PersonCard, PersonGrid } from "@/components/ui/person-card";
import { usePlatform } from "@/components/platform/provider";
export function ProfessionalSpeakers(){
 const {state}=usePlatform();const speakers=state.events.filter(e=>e.publication==="published").flatMap(e=>e.speakers).filter((s,i,a)=>a.findIndex(x=>x.name===s.name)===i);
 if(!speakers.length)return null;
 return <section className="brand-section people-section" aria-labelledby="professional-speakers-heading"><div className="brand-container"><div className="people-heading"><h2 id="professional-speakers-heading">Pemateri</h2></div><PersonGrid count={speakers.length}>{speakers.map(s=><PersonCard key={s.name} name={s.name} role={s.role} photo={s.photo} organization={s.organization}/>)}</PersonGrid></div></section>;
}
