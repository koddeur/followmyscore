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
            className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-background hover:text-foreground"
          >
            Scores
          </Link>
          <NavLinks user={user} variant="mobile" onNavigate={closeMobilePanel} />
          <ThemeToggle variant="row" />
        </div>
      )}
    </div>
  );
}
