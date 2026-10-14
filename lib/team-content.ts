import { companyProfile } from "@/lib/company-profile";

export function teamPhotoSection(index: number) {
  return `TeamMember-${index + 1}`;
}

export function isTeamPhotoSection(section: string) {
  return companyProfile.team.some((_, index) => teamPhotoSection(index) === section);
}
