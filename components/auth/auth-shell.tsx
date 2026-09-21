import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AuthShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="auth-minimal-page">
      <div className="auth-minimal-orbit auth-minimal-orbit--top" aria-hidden="true" />
      <div className="auth-minimal-orbit auth-minimal-orbit--bottom" aria-hidden="true" />
      <Link href="/" className="auth-minimal-home">
        <ArrowLeft size={15} aria-hidden="true" />
        Beranda
      </Link>
      <section className="auth-minimal-shell" aria-labelledby="auth-title">
        <div className="auth-minimal-card">
          <Link href="/" className="auth-minimal-brand" aria-label="Awan Event — Beranda">
            <Image src="/awan-event-logo.jpeg" alt="Awan Event" width={52} height={52} priority />
          </Link>
          <div className="auth-minimal-heading">
            <h1 id="auth-title">{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
