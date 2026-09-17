"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export function AdminUserSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      router.replace(value ? `/admin/users?q=${encodeURIComponent(value)}` : "/admin/users");
    }, 300);
  }

  return (
    <input
      type="search"
      defaultValue={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Rechercher par nom, username ou email…"
      aria-label="Rechercher un utilisateur"
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
    />
  );
}
