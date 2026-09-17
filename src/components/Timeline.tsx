import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { MatchStatus, UpdateType } from "../../generated/prisma/enums";

export interface TimelineEntry {
  id: string;
  type: UpdateType;
  message: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus | null;
  createdAt: Date;
  user: { name: string } | null;
}

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "à venir",
  LIVE: "en cours",
  HALFTIME: "mi-temps",
  INTERRUPTED: "interrompu",
  FINISHED: "terminé",
  POSTPONED: "reporté",
  CANCELLED: "annulé",
};

function describe(entry: TimelineEntry): string {
  switch (entry.type) {
    case "SCORE":
      return `Score mis à jour : ${entry.homeScore} – ${entry.awayScore}`;
    case "STATUS":
      return `Statut changé : ${entry.status ? STATUS_LABELS[entry.status] : ""}`;
    case "GOAL":
      return entry.message ?? "But ajouté";
    case "CARD":
      return entry.message ?? "Carton ajouté";
    case "SUBSTITUTION":
      return entry.message ?? "Changement effectué";
    case "LINEUP":
      return entry.message ?? "Composition mise à jour";
    case "NOTE":
    default:
      return entry.message ?? "Mise à jour";
  }
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-zinc-500">Aucune mise à jour pour le moment.</p>;
  }

  return (
    <ol className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-3 text-sm">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <div>
            <p>{describe(entry)}</p>
            <p className="text-xs text-zinc-500">
              {entry.user?.name ?? "Utilisateur supprimé"} ·{" "}
              {format(entry.createdAt, "d MMM 'à' HH:mm", { locale: fr })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
