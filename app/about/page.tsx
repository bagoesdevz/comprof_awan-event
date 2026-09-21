import type { Metadata } from "next";
import { PublicPageHero, PublicShell } from "@/components/site/public-shell";
import { CompanyProfilePage } from "@/components/landing/company-profile-page";
import { MotionObserver } from "@/components/landing/motion-observer";

export const metadata: Metadata = {
  title: "Tentang Awan Event — Pendidikan dan Pelatihan Kesehatan",
  description: "Profil Awan Event, layanan pendidikan dan pelatihan kesehatan di bawah naungan PT Awan Berkah Bermartabat.",
};

export default function AboutPage() {
  return (
    <PublicShell>
      <MotionObserver />
      <PublicPageHero
        eyebrow="Company Profile Awan Event"
        title="Pendidikan kesehatan yang terencana, aplikatif, dan berorientasi pada mutu."
        description="Awan Event menghubungkan peserta dan institusi dengan narasumber, trainer, fasilitator, serta jejaring profesional sesuai kebutuhan setiap program."
      />
      <CompanyProfilePage />
    </PublicShell>
  );
}
