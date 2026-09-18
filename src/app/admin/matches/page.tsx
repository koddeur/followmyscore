import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminMatchFilters } from "@/components/AdminMatchFilters";
import { DeleteMatchRowButton } from "@/components/DeleteMatchRowButton";
import type { MatchStatus } from "../../../../generated/prisma/enums";

const PAGE_SIZE = 25;
const VALID_STATUSES: MatchStatus[] = [
  "SCHEDULED",
  "LIVE",
  "HALFTIME",
  "INTERRUPTED",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
];

export default async function AdminMatchesPage({ searchParams }: PageProps<"/admin/matches">) {
  await requireRole("ADMIN");

  const { q, status, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const statusFilter =
    typeof status === "string" && VALID_STATUSES.includes(status as MatchStatus)
      ? (status as MatchStatus)
      : "";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = {
    ...(query
      ? {
          OR: [
            { homeClub: { name: { contains: query, mode: "insensitive" as const } } },
            { awayClub: { name: { contains: query, mode: "insensitive" as const } } },
            { competition: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (statusFilter) params.set("status", statusFilter);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/matches?${qs}` : "/admin/matches";
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Matchs</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Gère tous les matchs du site ({total} match{total > 1 ? "s" : ""}).
      </p>

      <div className="mb-4">
        <AdminMatchFilters defaultQuery={query} defaultStatus={statusFilter} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-zinc-500">
              <th className="px-4 py-3">Domicile</th>
              <th className="px-4 py-3">Extérieur</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Compétition</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                  {query || statusFilter ? "Aucun match ne correspond à ces critères." : "Aucun match."}
                </td>
              </tr>
            ) : (
              matches.map((match) => (
                <tr key={match.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/matches/${match.slug}`} className="hover:text-accent hover:underline">
                      {match.homeClub.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{match.awayClub.name}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {match.status === "SCHEDULED" ? "–" : `${match.homeScore} – ${match.awayScore}`}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={match.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{match.competition ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {match.kickoffAt ? format(match.kickoffAt, "d MMM yyyy HH:mm", { locale: fr }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteMatchRowButton
                      matchId={match.id}
                      label={`${match.homeClub.name} vs ${match.awayClub.name}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:border-accent"
            >
              Précédent
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Précédent</span>
          )}
          <span className="text-zinc-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:border-accent"
            >
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
