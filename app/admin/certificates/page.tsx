import type { Metadata } from "next";
import { CertificateMonitoring } from "@/components/admin/certificate-monitoring";
import { PageHeading } from "@/components/platform/ui";

export const metadata: Metadata = {
  title: "Monitoring Sertifikat — Awan Event Admin",
  description: "Pantau penerbitan dan distribusi sertifikat peserta.",
};

export default function AdminCertificatesPage() {
  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeading
        title="Monitoring sertifikat"
        description="Pantau status penerbitan dan kelayakan sertifikat peserta event."
      />
      <div className="mt-8">
        <CertificateMonitoring />
      </div>
    </div>
  );
}
