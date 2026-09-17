import Link from "next/link";
import { auth } from "@/auth";
import { NavLinks } from "@/components/NavLinks";
import { NavSearch } from "@/components/NavSearch";
import { MobileNav } from "@/components/MobileNav";

export async function Navbar() {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-10 border-b border-border">
      {/* Kept off the sticky element itself: backdrop-filter on a position:sticky
          ancestor is known to break tap/click hit-testing for its children on iOS
          Safari, even though it renders fine visually everywhere. */}
      <div className="absolute inset-0 -z-10 bg-card/80 backdrop-blur" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground text-xs font-bold">
            FMS
          </span>
          <span className="text-lg">FollowMyScore</span>
        </Link>

        <div className="hidden flex-1 justify-center sm:flex">
          <div className="w-full max-w-xs">
            <NavSearch />
          </div>
        </div>

        <nav className="hidden shrink-0 items-center gap-3 text-sm sm:flex">
          <NavLinks user={user} />
        </nav>

        <MobileNav user={user} />
      </div>
    </header>
  );
}
