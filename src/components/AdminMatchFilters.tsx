"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { STATUS_LABELS } from "@/components/StatusBadge";
import type { MatchStatus } from "../../generated/prisma/enums";

const STATUSES: MatchStatus[] = [
  "SCHEDULED",
  "LIVE",
  "HALFTIME",
  "INTERRUPTED",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
];

export function AdminMatchFilters({
  defaultQuery,
  defaultStatus,
}: {
  defaultQuery: string;
  defaultStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleQueryChange(value: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => updateParams({ q: value }), 300);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        defaultValue={defaultQuery}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Rechercher par club ou compétition…"
        aria-label="Rechercher un match"
        className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <select
        defaultValue={defaultStatus}
        onChange={(e) => updateParams({ status: e.target.value })}
        aria-label="Filtrer par statut"
        className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
      >
        <option value="">Tous les statuts</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
