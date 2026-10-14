"use client";

import { companyProfile } from "@/lib/company-profile";
import { CmsContent } from "@/components/site/cms-content";
import { usePlatform } from "@/components/platform/provider";
import { PersonCard, PersonGrid } from "@/components/ui/person-card";
import { teamPhotoSection } from "@/lib/team-content";

export function TeamCarousel() {
  const { state } = usePlatform();
  return <section id="tim" className="brand-section people-section"><div className="brand-container">
    <div className="people-heading"><CmsContent section="Team" fallbackTitle="Tim Awan Event" /></div>
    <PersonGrid count={companyProfile.team.length}>{companyProfile.team.map((member, index) => <PersonCard
      key={member.name} name={member.name} role={member.role} photo={state.cms[teamPhotoSection(index)]?.image}
    />)}</PersonGrid>
  </div></section>;
}
