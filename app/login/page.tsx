import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Masuk — Awan Event",
  description: "Masuk ke dashboard peserta atau admin Awan Event.",
};

export default function LoginPage() {
  return (
    <AuthShell title="Masuk ke Awan Event">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
