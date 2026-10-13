import { Verification } from "@/components/platform/certificates";
import { PublicShell } from "@/components/site/public-shell";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return {
    title: "Verifikasi Sertifikat | Awan Event",
    description: "Periksa keaslian sertifikat yang diterbitkan oleh Awan Event.",
    robots: "noindex",
  };
}

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }){const route=await params;
  return (
    <PublicShell>
      <Verification token={route.token} />
    </PublicShell>
  );
}
