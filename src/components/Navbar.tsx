import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import { NavSearch } from "@/components/NavSearch";
import { MobileNavTriggers } from "@/components/MobileNavTriggers";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavUser {
  name?: string | null;
  username?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
}

export function Navbar({ user }: { user: NavUser | null }) {
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
          <div className="w-full max-w-xl">
            <NavSearch />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-3">
          <nav className="hidden shrink-0 items-center gap-3 text-sm sm:flex">
            <Link
              href="/matches"
              className="flex h-9 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-accent bg-accent px-3 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Scores
            </Link>
            <NavLinks user={user} />
          </nav>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <MobileNavTriggers />
        </div>
      </div>
    </header>
  );
}
