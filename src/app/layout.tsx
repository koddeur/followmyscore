import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { MobileNavPanel } from "@/components/MobileNavPanel";
import { SocialLinks } from "@/components/SocialLinks";
import { CookieBanner } from "@/components/CookieBanner";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  // avatarUrl isn't on the session/JWT: manually-uploaded avatars are stored
  // as base64 data URIs (tens of KB), and putting that in the session cookie
  // blows past the HTTP header size limit (431 errors). Fetched fresh here
  // once and shared by both Navbar and MobileNavPanel.
  const avatarUrl = session?.user
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarUrl: true } }))
        ?.avatarUrl ?? null
    : null;
  const user = session?.user ? { ...session.user, avatarUrl } : null;

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar user={user} />
        <MobileNavPanel user={user} />
        <EmailVerificationBanner />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-xs text-zinc-500">
          <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 px-4 text-center sm:grid-cols-[1fr_auto_1fr] sm:px-6 sm:text-left">
            <p className="sm:justify-self-start">FollowMyScore — Tous droits réservés.</p>

            <div className="sm:justify-self-center">
              <SocialLinks />
            </div>

            <nav className="flex flex-col items-center gap-1 sm:items-end sm:justify-self-end">
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
            </nav>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
