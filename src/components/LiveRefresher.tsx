"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MatchStatus } from "../../generated/prisma/enums";

const LIVE_INTERVAL_MS = 3000;
const IDLE_INTERVAL_MS = 45000;

/**
 * Polls the match page in the background so goals/cards/substitutions/status
 * changes from other users (or the status transitioning e.g. SCHEDULED ->
 * LIVE) show up without the viewer having to refresh manually. Always on —
 * a scheduled or finished match can still change (kickoff starts it, a
 * finished match's stats get corrected) — just at a slower pace than while
 * the match is actually being played.
 */
export function LiveRefresher({ status }: { status: MatchStatus }) {
  const router = useRouter();
  const intervalMs = status === "LIVE" || status === "HALFTIME" ? LIVE_INTERVAL_MS : IDLE_INTERVAL_MS;

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, router]);

  return null;
}
