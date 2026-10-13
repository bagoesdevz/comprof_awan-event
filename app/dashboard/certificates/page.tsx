import { CertificateList } from "@/components/dashboard/certificate-list";

export default function ParticipantCertificatesPage() {
  return <div className="mx-auto max-w-[1280px]"><header><h1 className="mt-4 text-[clamp(38px,5vw,64px)] font-semibold leading-[0.96] tracking-tight">Sertifikat</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-content-body">Unduh sertifikat yang sudah terbit atau bagikan halaman verifikasi publik kepada institusi Anda.</p></header><CertificateList /></div>;
}
