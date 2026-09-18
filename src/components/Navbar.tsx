import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NavLinks } from "@/components/NavLinks";
import { NavSearch } from "@/components/NavSearch";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function Navbar() {
  const session = await auth();

  // avatarUrl isn't on the session/JWT: manually-uploaded avatars are stored
  // as base64 data URIs (tens of KB), and putting that in the session cookie
  // blows past the HTTP header size limit (431 errors). Fetched fresh here
  // instead, same as every other page that shows an avatar.
  const avatarUrl = session?.user
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarUrl: true } }))
        ?.avatarUrl ?? null
    : null;
  const user = session?.user ? { ...session.user, avatarUrl } : null;

  return (
    <header className="sticky top-0 z-10 border-b border-border">
      {/* Kept off the sticky element itself: backdrop-filter on a position:sticky
          ancestor is known to break tap/click hit-testing for its children on iOS
          Safari, even though it renders fine visually everywhere. */}
      <div className="absolute inset-0 -z-10 bg-card/80 backdrop-blur" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 justify-self-start font-semibold tracking-tight"
        >
          <Image
            src="/logo.png"
            alt="FollowMyScore"
            width={44}
            height={44}
            className="h-9 w-9 shrink-0 rounded-lg object-cover sm:h-11 sm:w-11"
            priority
          />
          <span className="truncate text-base sm:text-lg">FollowMyScore</span>
        </Link>

        <div className="hidden justify-self-center sm:flex">
          <div className="w-full max-w-xs">
            <NavSearch />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-3">
          <nav className="hidden shrink-0 items-center gap-3 text-sm sm:flex">
            <NavLinks user={user} />
          </nav>

          <ThemeToggle />
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
