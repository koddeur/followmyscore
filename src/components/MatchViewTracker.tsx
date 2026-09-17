"use client";

import { useEffect, useRef } from "react";
import { incrementMatchView } from "@/app/actions/matches";

export function MatchViewTracker({ matchId }: { matchId: string }) {
  const firedRef = useRef(false);

  useEffect(() => {
    // Runs once per real page load — router.refresh() (used by LiveRefresher
    // to poll live matches) re-renders without remounting this component,
    // so it won't inflate the count.
    if (firedRef.current) return;
    firedRef.current = true;
    incrementMatchView(matchId);
  }, [matchId]);

  return null;
}
