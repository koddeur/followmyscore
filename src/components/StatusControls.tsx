"use client";

import { updateStatus } from "@/app/actions/matches";
import type { MatchStatus } from "../../generated/prisma/enums";

const OPTIONS: { value: MatchStatus; label: string }[] = [
  { value: "SCHEDULED", label: "À venir" },
  { value: "LIVE", label: "En cours" },
  { value: "HALFTIME", label: "Mi-temps" },
  { value: "INTERRUPTED", label: "Interrompu" },
  { value: "FINISHED", label: "Terminé" },
  { value: "POSTPONED", label: "Reporté" },
  { value: "CANCELLED", label: "Annulé" },
];

export function StatusControls({
  matchId,
  status,
}: {
  matchId: string;
  status: MatchStatus;
}) {
  const action = updateStatus.bind(null, matchId);

  return (
    <form action={action} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={status}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent"
      >
        Changer
      </button>
    </form>
  );
}
