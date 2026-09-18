import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StatusBadge } from "@/components/StatusBadge";
import { ClubLogo } from "@/components/ClubLogo";
import type { MatchStatus } from "../../generated/prisma/enums";

export interface MatchCardData {
  id: string;
  slug: string;
  homeClub: { name: string; logoUrl: string | null };
  awayClub: { name: string; logoUrl: string | null };
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  competition: string | null;
  venue: string | null;
  kickoffAt: Date | null;
  viewCount: number;
}

export function MatchCard({ match, showViews = false }: { match: MatchCardData; showViews?: boolean }) {
  const started = match.status !== "SCHEDULED";

  return (
    <Link
      href={`/matches/${match.slug}`}
      className="block rounded-2xl border border-border bg-card p-4 transition hover:border-accent/60 hover:shadow-sm sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 truncate text-xs text-zinc-500">{match.competition}</div>
        <div className="shrink-0">
          <StatusBadge status={match.status} />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <ClubLogo logoUrl={match.homeClub.logoUrl} name={match.homeClub.name} className="h-6 w-6" />
            <span className="min-w-0 truncate font-medium">{match.homeClub.name}</span>
          </div>
          <span className="shrink-0 font-mono font-semibold tabular-nums">
            {started ? match.homeScore : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <ClubLogo logoUrl={match.awayClub.logoUrl} name={match.awayClub.name} className="h-6 w-6" />
            <span className="min-w-0 truncate font-medium">{match.awayClub.name}</span>
          </div>
          <span className="shrink-0 font-mono font-semibold tabular-nums">
            {started ? match.awayScore : ""}
          </span>
        </div>
      </div>

      {(match.kickoffAt || showViews) && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-500">
          <span className="min-w-0 truncate">
            {match.kickoffAt && format(match.kickoffAt, "d MMM yyyy 'à' HH:mm", { locale: fr })}
          </span>
          {showViews && (
            <span className="flex shrink-0 items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {match.viewCount}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
