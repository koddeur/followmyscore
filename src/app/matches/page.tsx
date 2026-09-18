import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MatchStatusFilter } from "@/components/MatchStatusFilter";
import { STATUS_PRIORITY, STATUS_FILTER_GROUPS, isMatchStatusFilter } from "@/lib/matchStatus";

const PAGE_SIZE = 30;

export const metadata = {
  title: "Tous les matchs — FollowMyScore",
  description: "Retrouve tous les matchs de football amateur suivis sur FollowMyScore.",
};

export default async function AllMatchesPage({ searchParams }: PageProps<"/matches">) {
  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const statusFilter =
    typeof statusParam === "string" && isMatchStatusFilter(statusParam) ? statusParam : null;
  const where = statusFilter ? { status: { in: STATUS_FILTER_GROUPS[statusFilter] } } : undefined;

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      include: { homeClub: true, awayClub: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.match.count({ where }),
  ]);

  matches.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/matches?${qs}` : "/matches";
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tous les matchs</h1>
          <p className="text-sm text-zinc-500">
            {total} match{total > 1 ? "s" : ""} suivi{total > 1 ? "s" : ""} sur FollowMyScore.
          </p>
        </div>
        <Link
          href="/matches/new"
          className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-center text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Créer un match
        </Link>
      </div>

      <MatchStatusFilter active={statusFilter} />

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-zinc-500">
          {statusFilter ? (
            "Aucun match ne correspond à ce filtre."
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="rounded-lg border border-border px-3 py-1.5 hover:border-accent">
              Précédent
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Précédent</span>
          )}
          <span className="text-zinc-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="rounded-lg border border-border px-3 py-1.5 hover:border-accent">
              Suivant
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Suivant</span>
          )}
        </div>
      )}
    </div>
  );
}
