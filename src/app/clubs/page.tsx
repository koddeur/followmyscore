import Link from "next/link";
import { searchClubs, countClubSearch } from "@/lib/clubSearch";
import { ClubLogo } from "@/components/ClubLogo";

const PAGE_SIZE = 24;

export const metadata = {
  title: "Recherche de clubs — FollowMyScore",
  description: "Retrouve tous les clubs correspondant à ta recherche, fautes de frappe incluses.",
};

export default async function ClubsSearchPage({ searchParams }: PageProps<"/clubs">) {
  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = Math.max(1, Number(pageParam) || 1);

  const [clubs, total] = query
    ? await Promise.all([
        searchClubs(query, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
        countClubSearch(query),
      ])
    : [[], 0];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/clubs?${qs}` : "/clubs";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Recherche de clubs</h1>
        {query ? (
          <p className="text-sm text-zinc-500">
            {total} club{total > 1 ? "s" : ""} correspondant à « {query} ».
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Utilise la recherche depuis l&apos;accueil ou la navigation pour trouver un club.
          </p>
        )}
      </div>

      {query && clubs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-zinc-500">
          Aucun club ne correspond à « {query} », même en tenant compte d&apos;éventuelles fautes de
          frappe.
        </div>
      )}

      {clubs.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.fffId ?? club.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-accent/60"
            >
              <ClubLogo logoUrl={club.logoUrl} name={club.name} className="h-9 w-9" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{club.name}</span>
                {club.city && <span className="block truncate text-xs text-zinc-500">{club.city}</span>}
              </span>
            </Link>
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
