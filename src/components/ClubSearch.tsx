"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

export function ClubSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(newValue: string) {
    setValue(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      router.replace(newValue ? `/?q=${encodeURIComponent(newValue)}` : "/");
    }, 300);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const trimmed = value.trim();
    if (!trimmed) return;

    router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Rechercher un club… (Entrée pour voir tous les résultats)"
        aria-label="Rechercher un club"
        className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-base shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </form>
  );
}
