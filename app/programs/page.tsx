import Link from "next/link";
import { ArrowRight, GraduationCap, Users, Building2 } from "lucide-react";
import { PublicPageHero, PublicShell } from "@/components/site/public-shell";
import { programs } from "@/lib/prd-platform";

const icons = [GraduationCap, Users, Building2];

export default function ProgramsPage() {
  return <PublicShell><PublicPageHero eyebrow="Layanan dan program" title="Pelatihan yang relevan dengan kebutuhan Anda." description="Dari kelas publik hingga pelatihan untuk organisasi, temukan program untuk mengembangkan kompetensi dan membuka kesempatan baru." /><section className="brand-container brand-section featured-program-grid">{programs.map((item,index)=>{ const Icon = icons[index % icons.length]; return <article key={item.slug} className="flow-panel flex min-h-80 flex-col items-start"><span className="brand-icon"><Icon size={25} aria-hidden="true"/></span><span className="brand-eyebrow mt-6">{item.format}</span><h2 className="mt-3 text-2xl font-semibold leading-snug">{item.title}</h2><p className="mb-5 mt-4 text-sm leading-7 text-content-body">{item.description}</p><Link href="/programs/request" className="brand-text-link mt-auto">Diskusikan program <ArrowRight size={16} aria-hidden="true"/></Link></article>;})}</section></PublicShell>;
}
