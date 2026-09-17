import type { MatchStatus } from "../../generated/prisma/enums";

export const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "À venir",
  LIVE: "En cours",
  HALFTIME: "Mi-temps",
  INTERRUPTED: "Interrompu",
  FINISHED: "Terminé",
  POSTPONED: "Reporté",
  CANCELLED: "Annulé",
};

const STYLES: Record<MatchStatus, string> = {
  SCHEDULED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  LIVE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  HALFTIME: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  INTERRUPTED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  FINISHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  POSTPONED: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  CANCELLED: "bg-zinc-200 text-zinc-500 line-through dark:bg-zinc-800 dark:text-zinc-500",
};

export function StatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {status === "LIVE" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
        </span>
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
