import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";
import { NavSearch } from "@/components/NavSearch";
import { STATUS_PRIORITY } from "@/lib/matchStatus";

export default async function HomePage() {
  const [matches, liveMatches, mostViewedMatches] = await Promise.all([
    prisma.match.findMany({
      include: { homeClub: true, awayClub: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.match.findMany({
      where: { status: { in: ["LIVE", "HALFTIME", "INTERRUPTED"] } },
      include: { homeClub: true, awayClub: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.match.findMany({
      where: { viewCount: { gt: 0 } },
      include: { homeClub: true, awayClub: true },
      orderBy: { viewCount: "desc" },
      take: 6,
    }),
  ]);

  matches.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  return (
    <div className="space-y-8">
      <header className="space-y-4 py-8 text-center sm:py-12">
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- avoids next/image's optimizer, which needs sharp (unavailable on this host) */}
          <img
            src="/logo.png"
            alt="FollowMyScore"
            className="mx-auto mb-4 h-20 w-20 sm:h-24 sm:w-24"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Follow<span className="text-accent">My</span>Score
          </h1>
          <p className="text-sm text-zinc-500 sm:text-base">
            Résultats et suivi en direct des matchs de football amateur, mis à jour par la communauté.
          </p>
        </div>
        <div className="mx-auto w-full max-w-3xl text-left">
          <NavSearch size="lg" />
        </div>
      </header>

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
        {(liveMatches.length > 0 || mostViewedMatches.length > 0) && (
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Tous les matchs</h2>
            {matches.length > 0 && (
              <Link href="/matches" className="ml-auto text-sm font-medium text-accent hover:underline">
                Voir tous les matchs →
              </Link>
            )}
          </div>
        )}

        {matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-zinc-500">
            Aucun match pour le moment.{" "}
            <Link href="/matches/new" className="font-medium text-accent hover:underline">
              Crée le premier match
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} showViews />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <h2 className="text-lg font-semibold tracking-tight">Tu ne trouves pas ton match ?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          Si le match que tu cherches n&apos;existe pas encore sur FollowMyScore, crée-le en
          quelques secondes pour commencer à suivre son score et le partager.
        </p>
        <Link
          href="/matches/new"
          className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Créer un match
        </Link>
      </div>
    </div>
  );
}
