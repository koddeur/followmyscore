"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresher({
  active,
  intervalMs = 20000,
}: {
  active: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, router]);

  return null;
}
