import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ClubLogo } from "@/components/ClubLogo";
import { AdminClubSearch } from "@/components/AdminClubSearch";
import { DeleteClubRowButton } from "@/components/DeleteClubRowButton";

const PAGE_SIZE = 25;

export default async function AdminClubsPage({ searchParams }: PageProps<"/admin/clubs">) {
  await requireRole("ADMIN");

  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { shortName: { contains: query, mode: "insensitive" as const } },
          { city: { contains: query, mode: "insensitive" as const } },
          { fffId: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [clubs, total] = await Promise.all([
    prisma.club.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { homeMatches: true, awayMatches: true } } },
    }),
    prisma.club.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/clubs?${qs}` : "/admin/clubs";
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Clubs</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Gère tous les clubs du site ({total} club{total > 1 ? "s" : ""}).
      </p>

      <div className="mb-4">
        <AdminClubSearch defaultValue={query} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-zinc-500">
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">fffId</th>
              <th className="px-4 py-3">Matchs</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clubs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  {query ? <>Aucun club ne correspond à « {query} ».</> : "Aucun club."}
                </td>
              </tr>
            ) : (
              clubs.map((club) => {
                const matchCount = club._count.homeMatches + club._count.awayMatches;
                return (
                  <tr key={club.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clubs/${club.fffId ?? club.id}`}
                        className="flex items-center gap-2 hover:text-accent hover:underline"
                      >
                        <ClubLogo logoUrl={club.logoUrl} name={club.name} className="h-6 w-6" />
                        {club.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{club.city ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-500">{club.fffId ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-500">{matchCount}</td>
                    <td className="px-4 py-3 text-right">
                      {matchCount === 0 && <DeleteClubRowButton clubId={club.id} label={club.name} />}
                    </td>
                  </tr>
                );
              })
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
