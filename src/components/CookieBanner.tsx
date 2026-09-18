"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie-notice-dismissed";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Storage unavailable (private browsing, blocked site data…) — show the
    // notice anyway, it just won't be remembered across reloads.
    return false;
  }
}

// The server can't read localStorage, so it always renders "dismissed" (no
// banner). useSyncExternalStore uses this for the first client render too
// (matching hydration), then immediately re-checks getSnapshot and re-renders
// if a returning visitor already dismissed it — no hydration mismatch either way.
function getServerSnapshot(): boolean {
  return true;
}

export function CookieBanner() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing else to do if storage isn't available.
    }
    listeners.forEach((listener) => listener());
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
