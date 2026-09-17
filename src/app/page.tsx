import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";
import { ClubSearch } from "@/components/ClubSearch";
import { searchClubs } from "@/lib/clubSearch";
import { STATUS_PRIORITY } from "@/lib/matchStatus";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const [matches, liveMatches, mostViewedMatches, matchingClubs] = await Promise.all([
    prisma.match.findMany({
      where: query
        ? {
            OR: [
              { homeClub: { name: { contains: query, mode: "insensitive" } } },
              { awayClub: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: { homeClub: true, awayClub: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    query
      ? Promise.resolve([])
      : prisma.match.findMany({
          where: { status: { in: ["LIVE", "HALFTIME", "INTERRUPTED"] } },
          include: { homeClub: true, awayClub: true },
          orderBy: { updatedAt: "desc" },
          take: 6,
        }),
    query
      ? Promise.resolve([])
      : prisma.match.findMany({
          where: { viewCount: { gt: 0 } },
          include: { homeClub: true, awayClub: true },
          orderBy: { viewCount: "desc" },
          take: 6,
        }),
    query ? searchClubs(query, { limit: 25 }) : Promise.resolve([]),
  ]);

  matches.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const clubsOverflow = matchingClubs.length > 24;
  const shownClubs = clubsOverflow ? matchingClubs.slice(0, 24) : matchingClubs;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matchs</h1>
          <p className="text-sm text-zinc-500">
            Résultats et suivi en direct des matchs de football amateur, mis à jour par la communauté.
          </p>
        </div>
        <Link
          href="/matches/new"
          className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-center text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Créer un match
        </Link>
      </div>

      <ClubSearch defaultValue={query} />

      {query && shownClubs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-500">Clubs</h2>
          <div className="flex flex-wrap gap-2">
            {shownClubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.fffId ?? club.id}`}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm transition hover:border-accent/60"
              >
                {club.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.logoUrl} alt="" className="h-6 w-6 rounded-full object-contain" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-zinc-400">
                    {club.name.charAt(0)}
                  </span>
                )}
                <span>{club.name}</span>
              </Link>
            ))}
            {clubsOverflow && (
              <Link
                href={`/recherche?q=${encodeURIComponent(query)}`}
                className="flex items-center px-2 text-sm font-medium text-accent hover:underline"
              >
                Voir tous les résultats →
              </Link>
            )}
          </div>
        </div>
      )}

      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            En ce moment
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} showViews />
            ))}
          </div>
        </div>
      )}

      {mostViewedMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Matchs les plus suivis</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mostViewedMatches.map((match) => (
              <MatchCard key={match.id} match={match} showViews />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!query && (
          <div className="flex items-center justify-between gap-3">
            {(liveMatches.length > 0 || mostViewedMatches.length > 0) && (
              <h2 className="text-lg font-semibold tracking-tight">Tous les matchs</h2>
            )}
            {matches.length > 0 && (
              <Link href="/matches" className="ml-auto text-sm font-medium text-accent hover:underline">
                Voir tous les matchs →
              </Link>
            )}
          </div>
        )}

        {matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-zinc-500">
            {query ? (
              <>Aucun match ne correspond à « {query} ».</>
            ) : (
              <>
                Aucun match pour le moment.{" "}
                <Link href="/matches/new" className="font-medium text-accent hover:underline">
                  Crée le premier match
                </Link>
                .
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} showViews />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
