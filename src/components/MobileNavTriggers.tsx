"use client";

import { useSyncExternalStore } from "react";
import { getMobilePanel, subscribeMobilePanel, toggleMobilePanel } from "@/components/mobileNavPanelStore";

const triggerButtonClass =
  "flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-border text-zinc-500 hover:border-accent hover:text-foreground sm:hidden";

function getServerSnapshot() {
  return "none" as const;
}

/** The search/hamburger icon buttons that live in the nav bar itself. */
export function MobileNavTriggers() {
  const panel = useSyncExternalStore(subscribeMobilePanel, getMobilePanel, getServerSnapshot);

  return (
    <div className="flex items-center gap-2 sm:hidden">
      <button
        type="button"
        onClick={() => toggleMobilePanel("search")}
        aria-label={panel === "search" ? "Fermer la recherche" : "Rechercher"}
        aria-expanded={panel === "search"}
        className={triggerButtonClass}
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => toggleMobilePanel("menu")}
        aria-label={panel === "menu" ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={panel === "menu"}
        className={triggerButtonClass}
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
          {panel === "menu" ? (
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
    </div>
  );
}
