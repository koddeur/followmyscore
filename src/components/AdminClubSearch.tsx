"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export function AdminClubSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      router.replace(value ? `/admin/clubs?q=${encodeURIComponent(value)}` : "/admin/clubs");
    }, 300);
  }

  return (
    <input
      type="search"
      defaultValue={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Rechercher par nom, ville ou fffId…"
      aria-label="Rechercher un club"
      className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
    />
  );
}
