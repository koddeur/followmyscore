import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { SocialLinks } from "@/components/SocialLinks";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FollowMyScore — Matchs amateurs en direct",
  description:
    "Suivez et mettez à jour en direct les résultats de matchs de football amateur.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-zinc-500">
          <p>FollowMyScore — projet collaboratif de suivi de matchs amateurs.</p>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/comment-ca-marche" className="hover:text-foreground hover:underline">
              Comment ça marche
            </Link>
            <Link href="/contact" className="hover:text-foreground hover:underline">
              Contacter le support
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground hover:underline">
              Mentions légales
            </Link>
            <Link href="/rgpd" className="hover:text-foreground hover:underline">
              RGPD
            </Link>
            <Link href="/cgu" className="hover:text-foreground hover:underline">
              CGU
            </Link>
          </p>
          <SocialLinks />
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
