import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CompanyStory, ContactCta, ServicesSection, TrustBar } from "@/components/landing/company-story";
import { MotionObserver } from "@/components/landing/motion-observer";
import { LearningHero } from "@/components/landing/learning-hero";
import { FeaturedPrograms } from "@/components/landing/featured-programs";
import { ProfessionalSpeakers } from "@/components/landing/professional-speakers";
import { PublicShell } from "@/components/site/public-shell";

export default function HomePage() {
  return (
    <PublicShell>
      <MotionObserver />
      <LearningHero />
      <TrustBar />
      <CompanyStory section="about" />
      <section id="event-list" className="brand-section featured-programs">
        <div className="brand-container">
          <div className="brand-section-heading"><div data-reveal><h2>Event mendatang</h2></div><div><Link href="/events" className="brand-text-link">Lihat semua event <ArrowRight size={16} aria-hidden="true" /></Link></div></div>
          <FeaturedPrograms />
        </div>
      </section>
      <ServicesSection />
      <ProfessionalSpeakers />
      <CompanyStory section="vision" />
      <ContactCta />
    </PublicShell>
  );
}
