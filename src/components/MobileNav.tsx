"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavLinks } from "@/components/NavLinks";
import { NavSearch } from "@/components/NavSearch";

interface NavUser {
  name?: string | null;
  username?: string | null;
  role?: string | null;
}

export function MobileNav({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-border text-zinc-500 hover:border-accent hover:text-foreground sm:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none h-5 w-5"
          aria-hidden="true"
        >
          {open ? (
            <>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </>
          ) : (
            <>
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="w-full border-t border-border pt-3 sm:hidden">
          <NavSearch />
          <div className="mt-3">
            <NavLinks user={user} variant="mobile" onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
