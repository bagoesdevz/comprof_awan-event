import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  Building2,
  Check,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Mail,
  MonitorPlay,
  Network,
  Phone,
  Presentation,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { BrandWaves } from "@/components/brand/brand-elements";
import { companyProfile } from "@/lib/company-profile";
import { TeamCarousel } from "@/components/landing/team-carousel";

const serviceIcons = [GraduationCap, Presentation, UsersRound, MonitorPlay, BookOpenCheck, Building2, Lightbulb, Network];
const valueIcons = [Award, ShieldCheck, Handshake, Lightbulb, Sparkles, HeartHandshake];

export function CompanyProfilePage() {
  return (
    <>
      <section id="profil" className="brand-section bg-white">
        <div className="brand-container grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="relative isolate overflow-hidden rounded-[32px_32px_32px_8px] bg-primary-950 p-8 text-white sm:p-10" data-reveal>
            <BrandWaves className="-bottom-40 -right-48 h-[34rem] w-[42rem] opacity-30" />
            <div className="relative">
              <span className="grid h-20 w-20 overflow-hidden rounded-full border-4 border-white/10 bg-white">
                <Image src="/awan-event-logo.jpeg" alt="Logo Awan Event" width={80} height={80} className="h-full w-full object-cover" />
              </span>
              <p className="mt-9 text-xs font-semibold uppercase tracking-[0.12em] text-primary-400">Organisasi pendidikan dan pelatihan kesehatan</p>
              <h2 className="mt-4 max-w-lg text-[clamp(32px,4vw,52px)] font-semibold leading-[1.02] tracking-tight">Kompetensi yang bertumbuh. Pelayanan yang lebih bermutu.</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/65">{companyProfile.tagline}</p>
              <div className="mt-8 border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/40">Di bawah naungan</span>
                <strong className="mt-2 block text-sm">{companyProfile.legalEntity}</strong>
              </div>
            </div>
          </div>

          <div data-reveal>
            
            <h2 className="mt-5 max-w-2xl text-[clamp(36px,5vw,64px)] font-semibold leading-[0.98] tracking-tight">Wadah profesional untuk belajar, berlatih, dan berkembang.</h2>
            <div className="mt-7 grid gap-4 text-sm leading-7 text-content-body">
              {companyProfile.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <dl className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-primary-600/10 bg-primary-600/10 sm:grid-cols-3">
              {[['8', 'Portofolio layanan'], ['14+', 'Bidang materi'], ['3', 'Format kegiatan']].map(([value, label]) => <div key={label} className="bg-white p-5"><dt className="text-xs text-content-muted">{label}</dt><dd className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-primary-800">{value}</dd></div>)}
            </dl>
          </div>
        </div>
      </section>

      <section id="visi-misi" className="brand-section bg-surface-muted">
        <div className="brand-container grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <article className="relative isolate overflow-hidden rounded-[28px_28px_28px_8px] bg-primary-100 p-7 sm:p-10" data-reveal>
            <BrandWaves className="-bottom-40 -right-60 h-[34rem] w-[43rem] opacity-60" />
            <div className="relative">
              <span className="brand-icon"><Target size={26} aria-hidden="true" /></span>
              <span className="brand-eyebrow mt-8 block">Visi Awan Event</span>
              <h2 className="mt-5 text-[clamp(30px,4vw,46px)] font-semibold leading-[1.08] tracking-tight">Profesional, inovatif, terpercaya, dan berkelanjutan.</h2>
              <p className="mt-6 text-sm leading-7 text-content-body">{companyProfile.vision}</p>
            </div>
          </article>

          <div className="rounded-[28px_28px_28px_8px] border border-primary-600/10 bg-white p-7 sm:p-10" data-reveal>
            
            <ol className="mt-7 grid gap-x-7 gap-y-5 sm:grid-cols-2">
              {companyProfile.missions.map((mission, index) => <li key={mission} className="grid grid-cols-[34px_1fr] gap-3 border-t border-primary-600/10 pt-4"><span className="font-mono text-[10px] font-semibold text-primary-600">{String(index + 1).padStart(2, "0")}</span><p className="text-sm leading-6 text-content-body">{mission}</p></li>)}
            </ol>
          </div>
        </div>
      </section>

      <section id="layanan" className="brand-section bg-white">
        <div className="brand-container">
          <div className="brand-section-heading">
            <div data-reveal><h2>Program yang dapat disesuaikan<br />dengan kebutuhan Anda.</h2></div>
            <p data-reveal>Dari kegiatan publik hingga program khusus institusi, setiap layanan disusun berdasarkan sasaran, kompetensi, dan tujuan yang jelas.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {companyProfile.services.map((service, index) => {
              const Icon = serviceIcons[index];
              return <article key={service.title} className="group rounded-[24px_24px_24px_7px] border border-primary-600/10 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-diffusion" data-reveal><span className={`brand-icon ${index % 3 === 1 ? "brand-icon--blue" : index % 3 === 2 ? "brand-icon--pink" : ""}`}><Icon size={24} aria-hidden="true" /></span><h3 className="mt-6 text-lg font-semibold tracking-[-0.025em]">{service.title}</h3><p className="mt-3 text-sm leading-6 text-content-muted">{service.description}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section id="nilai" className="brand-section bg-primary-950 text-white">
        <div className="brand-container">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div data-reveal><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-400">Nilai organisasi</span><h2 className="mt-5 text-[clamp(36px,5vw,64px)] font-semibold leading-[0.98] tracking-tight">Prinsip yang menjaga mutu setiap kegiatan.</h2></div>
            <p className="max-w-xl text-sm leading-7 text-white/55 lg:justify-self-end" data-reveal>Nilai ini menjadi dasar dalam merancang program, melayani peserta, bekerja bersama mitra, dan melakukan perbaikan berkelanjutan.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[24px_24px_24px_7px] bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {companyProfile.values.map((value, index) => { const Icon = valueIcons[index]; return <article key={value.title} className="bg-primary-950 p-6 sm:p-7"><Icon className="h-5 w-5 text-primary-400" aria-hidden="true" /><h3 className="mt-5 text-lg font-semibold">{value.title}</h3><p className="mt-3 text-sm leading-6 text-white/50">{value.description}</p></article>; })}
          </div>
        </div>
      </section>

      <TeamCarousel />

      <section id="program" className="brand-section bg-white">
        <div className="brand-container grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[28px_28px_28px_8px] border border-primary-600/10 p-7 sm:p-9" data-reveal>
            
            <h2 className="mt-5 text-[clamp(30px,4vw,46px)] font-semibold leading-[1.05] tracking-[-0.045em]">Topik yang dekat dengan kebutuhan pelayanan kesehatan.</h2>
            <div className="mt-8 flex flex-wrap gap-2.5">{companyProfile.topics.map((topic) => <span key={topic} className="rounded-full border border-primary-600/10 bg-primary-100/60 px-4 py-2.5 text-xs font-medium text-primary-800">{topic}</span>)}</div>
            <p className="mt-6 text-xs leading-6 text-content-muted">Materi lain dapat dikembangkan sesuai kebutuhan mitra dan sasaran program.</p>
          </div>
          <div className="rounded-[28px_28px_28px_8px] bg-surface-muted p-7 sm:p-9" data-reveal>
            
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">Aktif, praktis, dan berorientasi pada penerapan.</h2>
            <ul className="mt-7 grid gap-3">{companyProfile.methods.map((method) => <li key={method} className="flex gap-3 rounded-xl bg-white p-3.5 text-sm text-content-body"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />{method}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="alur" className="brand-section bg-surface-muted">
        <div className="brand-container">
          <div className="brand-section-heading"><div data-reveal><h2>Dari kebutuhan<br />hingga tindak lanjut.</h2></div><p data-reveal>Setiap kegiatan dikelola sebagai satu siklus agar tujuan, pengalaman peserta, administrasi, dan evaluasinya tetap terhubung.</p></div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {companyProfile.process.map((item, index) => <li key={item.title} className="rounded-[22px_22px_22px_7px] border border-primary-600/10 bg-white p-5" data-reveal><span className="font-mono text-[10px] font-semibold text-primary-600">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-5 font-semibold">{item.title}</h3><p className="mt-3 text-xs leading-6 text-content-muted">{item.description}</p></li>)}
          </ol>
        </div>
      </section>

      <section id="kemitraan" className="brand-section bg-white">
        <div className="brand-container grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px_28px_28px_8px] border border-primary-600/10 p-7 sm:p-9" data-reveal>
            <span className="brand-icon brand-icon--blue"><UsersRound size={25} aria-hidden="true" /></span>
            <span className="brand-eyebrow mt-7 block">Sasaran peserta</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Untuk individu dan institusi kesehatan.</h2>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">{companyProfile.audiences.map((audience) => <li key={audience} className="flex items-center gap-3 text-sm text-content-body"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" />{audience}</li>)}</ul>
          </div>
          <div className="rounded-[28px_28px_28px_8px] bg-primary-100 p-7 sm:p-9" data-reveal>
            <span className="brand-icon brand-icon--pink"><Handshake size={25} aria-hidden="true" /></span>
            <span className="brand-eyebrow mt-7 block">Kerja sama dan kemitraan</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Bangun program yang sesuai kebutuhan organisasi.</h2>
            <ul className="mt-7 grid gap-3">{companyProfile.partnerships.map((item) => <li key={item} className="flex gap-3 text-sm text-content-body"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />{item}</li>)}</ul>
            <Link href="/programs/request" className="brand-button mt-8">Ajukan kerja sama <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section id="kontak-profil" className="pb-16 sm:pb-20 lg:pb-28">
        <div className="brand-container relative isolate overflow-hidden rounded-[30px_30px_30px_8px] bg-primary-950 p-7 text-white sm:p-10 lg:p-12">
          <BrandWaves className="-bottom-56 -right-40 h-[38rem] w-[44rem] opacity-30" />
          <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-400">Hubungi Awan Event</span><h2 className="mt-5 max-w-2xl text-[clamp(32px,5vw,56px)] font-semibold leading-[1.02] tracking-tight">Mari susun kegiatan yang relevan dan terarah.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/55">Diskusikan kebutuhan pelatihan, webinar, seminar, in house training, atau pengembangan program bersama tim kami.</p></div>
            <div className="grid gap-2 text-sm">
              <a href={`mailto:${companyProfile.contacts.email}`} className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 hover:bg-white/10"><Mail size={17} aria-hidden="true" />{companyProfile.contacts.email}</a>
              <a href="https://wa.me/6285815087774" target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 hover:bg-white/10"><Phone size={17} aria-hidden="true" />{companyProfile.contacts.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
