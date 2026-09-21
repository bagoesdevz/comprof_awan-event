import { ParticipantShell } from "@/components/dashboard/participant-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ParticipantShell>{children}</ParticipantShell>;
}
