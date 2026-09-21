import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Daftar Akun — Awan Event", description: "Buat akun peserta Awan Event." };

export default function RegisterAccountPage() {
  return <AuthShell title="Buat akun baru"><AuthForm mode="register" /></AuthShell>;
}
