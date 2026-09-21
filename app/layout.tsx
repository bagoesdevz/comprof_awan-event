import type { Metadata } from "next";
import { Caveat, DM_Mono } from "next/font/google";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import "./brand.css";
import "./speakers.css";
import "./testimonials.css";
import "./event-detail.css";
import "./production.css";
import { PlatformProvider } from "@/components/platform/provider";

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-brand-mono",
  display: "swap",
});

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "Awan Event — Learn, Grow, Bright Tomorrow",
  description:
    "Temukan event, training, assessment, dan sertifikasi profesional di Awan Event.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${mono.variable} ${caveat.variable}`}>
      <body><PlatformProvider>{children}</PlatformProvider></body>
    </html>
  );
}
