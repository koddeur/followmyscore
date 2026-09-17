"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const STORAGE_KEY = "cookie-notice-dismissed";

function readDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Storage unavailable (private browsing, blocked site data…) — show the
    // notice anyway, it just won't be remembered across reloads.
    return false;
  }
}

export function CookieBanner() {
  // Starts "dismissed" to match the server-rendered (empty) output; the ref
  // guard lets us read localStorage exactly once, during the client's first
  // render, before anything commits — see MobileNav/ContactForm for the same
  // pattern used elsewhere in this app.
  const [dismissed, setDismissed] = useState(true);
  const initRef = useRef<boolean | null>(null);

  if (initRef.current == null) {
    initRef.current = true;
    if (!readDismissed()) setDismissed(false);
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing else to do if storage isn't available.
    }
  }

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-sm text-zinc-500">
          FollowMyScore utilise uniquement un cookie strictement nécessaire au maintien de ta
          connexion — aucun cookie publicitaire ni de mesure d&apos;audience.{" "}
          <Link href="/rgpd" className="font-medium text-accent hover:underline">
            En savoir plus
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
