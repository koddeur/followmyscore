"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLinks } from "@/components/NavLinks";
import { NavSearch } from "@/components/NavSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { closeMobilePanel, getMobilePanel, subscribeMobilePanel } from "@/components/mobileNavPanelStore";

interface NavUser {
  name?: string | null;
  username?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
}

function getServerSnapshot() {
  return "none" as const;
}

/**
 * Sits as a sibling right after <header>, not inside it, so opening it never
 * resizes/shifts the sticky nav bar — it's a separate section below.
 */
export function MobileNavPanel({ user }: { user: NavUser | null }) {
  const panel = useSyncExternalStore(subscribeMobilePanel, getMobilePanel, getServerSnapshot);
  const pathname = usePathname();

  useEffect(() => {
    closeMobilePanel();
  }, [pathname]);

  useEffect(() => {
    if (panel === "none") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobilePanel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panel]);

  if (panel === "none") return null;

  return (
    <div className="border-b border-border bg-card px-4 py-3 sm:hidden">
      {panel === "search" && <NavSearch />}
      {panel === "menu" && (
        <div className="flex flex-col gap-1">
          <Link
            href="/matches"
            onClick={closeMobilePanel}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-background hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            Scores
          </Link>
          <NavLinks user={user} variant="mobile" onNavigate={closeMobilePanel} />
          <ThemeToggle variant="row" />
        </div>
      )}
    </div>
  );
}
