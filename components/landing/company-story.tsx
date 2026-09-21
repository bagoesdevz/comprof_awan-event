"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Building2, GraduationCap, Heart, Laptop, MapPin, Radio, ShieldCheck, Users } from "lucide-react";
import { BrandWaves } from "@/components/brand/brand-elements";
import { HorizontalAvatarsCTA } from "@/components/ui/horizontal-avatars-cta";
import { usePlatform } from "@/components/platform/provider";

const missions = [
  ["01", "Program bermutu dan relevan", "Menyelenggarakan pendidikan dan pelatihan kesehatan sesuai kebutuhan peserta dan institusi."],
  ["02", "Pengajar sesuai kompetensi", "Menghadirkan narasumber, trainer, dan fasilitator berdasarkan bidang keilmuannya."],
  ["03", "Belajar secara aplikatif", "Mengembangkan metode yang interaktif, praktis, dan berorientasi pada penerapan."],
  ["04", "Tumbuh melalui kolaborasi", "Memperluas akses pendidikan melalui jejaring profesional dan pemanfaatan teknologi digital."],
];

const trustGroups = [
  "Tenaga kesehatan",
  "Fasilitas kesehatan",
  "Institusi pendidikan",
  "Organisasi profesi",
  "Komunitas & mitra",
];

const proofMetrics = [
  ["8", "Portofolio layanan", "Pelatihan hingga konsultasi program."],
  ["14+", "Bidang materi", "Topik kesehatan dan mutu pelayanan."],
  ["3", "Format kegiatan", "Daring, tatap muka, dan hybrid."],
  ["8", "Tahap penyelenggaraan", "Dari identifikasi hingga tindak lanjut."],
];

const services = [
  ["01", "Pelatihan kesehatan", "Program terstruktur untuk meningkatkan pengetahuan, keterampilan, dan kompetensi."],
  ["02", "Workshop dan seminar", "Pembelajaran intensif melalui forum ilmiah, diskusi, studi kasus, dan praktik."],
  ["03", "Webinar", "Edukasi daring bersama narasumber kompeten dengan jangkauan yang lebih luas."],
  ["04", "In house training", "Program khusus berdasarkan kebutuhan organisasi atau fasilitas kesehatan."],
];

type CompanyStorySection = "all" | "about" | "vision" | "documentation";

export function CompanyStory({ section = "all" }: { section?: CompanyStorySection }) {
  const { state } = usePlatform();
  const cmsAbout = state.cms["About"];
  const aboutTitle = cmsAbout?.title || "Wadah Profesional untuk Kompetensi Kesehatan";
  const aboutParagraphs = cmsAbout?.body
    ? cmsAbout.body.split("\n\n").filter(Boolean)
    : [
        "Awan Event adalah organisasi pendidikan dan pelatihan kesehatan di bawah naungan PT Awan Berkah Bermartabat.",
        "Kami menyelenggarakan kegiatan yang terencana, terukur, aplikatif, dan berorientasi pada mutu melalui format daring, tatap muka, maupun hybrid.",
      ];
  const aboutImage = cmsAbout?.image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85";

  return (
    <>
      {(section === "all" || section === "about") && (
        <section id="tentang" className="brand-section about-section">
          <div className="brand-container about-layout">
            <div className="about-photo" data-reveal>
              <Image
                src={aboutImage}
                alt="Ilustrasi kolaborasi peserta dalam sesi belajar kelompok."
                fill
                sizes="(max-width: 760px) 90vw, 500px"
              />
              <div className="about-quote">
                <span aria-hidden="true">“</span>
                <p>Meningkatkan kompetensi tenaga kesehatan untuk pelayanan berkualitas.</p>
                <i />
              </div>
              <span className="photo-caption">Belajar. Berbagi. Bertumbuh.</span>
            </div>
            <div className="about-copy" data-reveal>
              <h2>{aboutTitle}</h2>
              {aboutParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              <Link href="/about" className="brand-button">
                Lihat company profile
              </Link>
              <ul className="about-values">
                <li><ShieldCheck size={18} aria-hidden="true" />Profesional</li>
                <li><GraduationCap size={18} aria-hidden="true" />Bermutu</li>
                <li><Heart size={18} aria-hidden="true" />Kolaboratif</li>
              </ul>
            </div>
          </div>
        </section>
      )}
      {(section === "all" || section === "vision") && (
        <section id="visi-misi" className="brand-section vision-section">
          <div className="brand-container vision-layout">
            <div className="vision-statement" data-reveal>
              <BrandWaves />
              <div>
                <h2>Profesional. Inovatif.<br />Terpercaya.</h2>
                <p>
                  Menjadi organisasi pendidikan dan pelatihan kesehatan yang profesional, inovatif,
                  terpercaya, dan berkelanjutan dalam meningkatkan kompetensi sumber daya manusia kesehatan.
                </p>
                <p className="vision-signature">Learn, Grow, Bright Tomorrow.</p>
              </div>
            </div>
            <div className="mission-list" data-reveal>
              {missions.map(([number, title, copy]) => (
                <article key={number}>
                  <span>{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export function TrustBar() {
  return (
    <section className="trust-strip">
      <div className="brand-container">
        <p>Ruang belajar untuk<br /><strong>berbagai bidang &amp; institusi</strong></p>
        <div>
          {trustGroups.map((group) => (
            <span key={group}>
              <Building2 size={19} aria-hidden="true" />{group}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SocialProof() {
  const icons = [GraduationCap, Users, Award, Radio];
  return (
    <section className="brand-container impact-strip" aria-label="Cakupan Awan Event">
      <dl>
        {proofMetrics.map(([value, label, copy], index) => {
          const Icon = icons[index];
          return (
            <div key={label}>
              <span className={`brand-icon ${index === 3 ? "brand-icon--pink" : index === 1 ? "brand-icon--blue" : ""}`} aria-hidden="true">
                <Icon size={28} />
              </span>
              <div>
                <dt>{label}</dt>
                <dd className="impact-value">{value}</dd>
                <dd className="impact-copy">{copy}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export function ServicesSection() {
  const { state } = usePlatform();
  const cmsServices = state.cms["Services"];
  const icons = [Laptop, MapPin, Radio, Award];
  const servicesTitle = cmsServices?.title || "Program yang relevan. Pembelajaran yang aplikatif.";
  const servicesDesc = cmsServices?.body || "Ikuti program publik atau susun kegiatan khusus yang sesuai dengan kebutuhan kompetensi peserta dan institusi.";

  return (
    <section id="layanan" className="brand-section services-section">
      <div className="brand-container">
        <div className="brand-section-heading">
          <div data-reveal>
            <h2>{servicesTitle}</h2>
          </div>
          <p data-reveal>{servicesDesc}</p>
        </div>
        <div className="service-grid">
          {services.map(([number, title, copy], index) => {
            const Icon = icons[index];
            return (
              <article key={number} data-reveal>
                <span className={`brand-icon ${index === 3 ? "brand-icon--pink" : ""}`}>
                  <Icon size={25} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <Link href="/events" className="brand-text-link">
                  Jelajahi event <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ContactCta() {
  const { state } = usePlatform();
  const cmsCta = state.cms["CTA"];

  return (
    <HorizontalAvatarsCTA
      id="kontak"
      title={cmsCta?.title ? cmsCta.title : <>Tingkatkan kompetensimu.<br />Jadilah orang hebat selanjutnya.</>}
      description={cmsCta?.body || "Temukan program sesuai kebutuhan Anda."}
      buttonText="Lihat event"
      buttonHref="/events"
      avatars={[]}
    />
  );
}
