import { Verification } from "@/components/platform/certificates";
import { PublicShell } from "@/components/site/public-shell";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { token: string } }) {
  return {
    title: "Verifikasi Sertifikat — Awan Event",
    description: "Periksa keaslian sertifikat yang diterbitkan oleh Awan Event.",
    robots: "noindex",
  };
}

export default function VerifyPage({ params }: { params: { token: string } }) {
  return (
    <PublicShell>
      <Verification token={params.token} />
    </PublicShell>
  );
}
