"use client";

import { useEffect } from "react";

/**
 * Next.js's built-in scroll-to-top on navigation doesn't always kick in
 * reliably (e.g. clicking a link deep in a long page). This forces it.
 */
export function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
