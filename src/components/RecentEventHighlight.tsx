"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const RECENT_MS = 2 * 60 * 1000;

/**
 * Highlights its children while `createdAt` is under 2 minutes old, then
 * fades back to normal on its own (no page refresh needed) — LiveRefresher
 * handles surfacing brand-new events, this handles them stop looking "new".
 *
 * State is only (re)computed at mount, so callers whose `createdAt` can
 * change for the *same* element position (e.g. the score number, updated by
 * each new goal) must pass `key={createdAt.getTime()}` to force a fresh
 * mount — otherwise a LiveRefresher poll swaps the prop in without React
 * re-running the initial "is this recent" check. List items keyed by their
 * own id (goals, timeline entries...) don't need this: a new event is
 * already a new key, and an existing one's createdAt never changes.
 *
 * `className` holds always-on structural classes (padding, rounding, border
 * width); `highlightClassName`/`idleClassName` are the two mutually
 * exclusive color states, kept separate so they never both apply the same
 * CSS property at once (which would make the outcome depend on stylesheet
 * order instead of the isRecent check).
 */
export function RecentEventHighlight({
  createdAt,
  children,
  className = "",
  highlightClassName = "border-accent/40 bg-accent/10",
  idleClassName = "border-transparent",
}: {
  createdAt: Date;
  children: ReactNode;
  className?: string;
  highlightClassName?: string;
  idleClassName?: string;
}) {
  const createdTime = createdAt.getTime();
  const [isRecent, setIsRecent] = useState(() => Date.now() - createdTime < RECENT_MS);

  useEffect(() => {
    // If already past 2 minutes, the lazy initializer above already started
    // as false — nothing to schedule.
    const remaining = RECENT_MS - (Date.now() - createdTime);
    if (remaining <= 0) return;

    const id = setTimeout(() => setIsRecent(false), remaining);
    return () => clearTimeout(id);
  }, [createdTime]);

  return (
    <div
      suppressHydrationWarning
      className={`transition-colors duration-700 ${className} ${isRecent ? highlightClassName : idleClassName}`}
    >
      {children}
    </div>
  );
}
