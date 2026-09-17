import Link from "next/link";
import { searchClubs, countClubSearch } from "@/lib/clubSearch";
import { searchMatches } from "@/lib/matchSearch";
import { searchUsers } from "@/lib/userSearch";
import { ClubLogo } from "@/components/ClubLogo";
import { MatchCard } from "@/components/MatchCard";
import { STATUS_PRIORITY } from "@/lib/matchStatus";

const CLUB_PAGE_SIZE = 24;
const OTHER_LIMIT = 12;

export const metadata = {
  title: "Résultats de recherche — FollowMyScore",
  description: "Retrouve les clubs, matchs et utilisateurs correspondant à ta recherche.",
};

export default async function RecherchePage({ searchParams }: PageProps<"/recherche">) {
  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = Math.max(1, Number(pageParam) || 1);

  const [clubs, clubTotal, matches, users] = query
    ? await Promise.all([
        searchClubs(query, { limit: CLUB_PAGE_SIZE, offset: (page - 1) * CLUB_PAGE_SIZE }),
        countClubSearch(query),
        searchMatches(query, OTHER_LIMIT),
        searchUsers(query, OTHER_LIMIT),
      ])
    : [[], 0, [], []];

  matches.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const totalClubPages = Math.max(1, Math.ceil(clubTotal / CLUB_PAGE_SIZE));
  const noResults = query.length > 0 && clubs.length === 0 && matches.length === 0 && users.length === 0;

  function clubPageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/recherche?${qs}` : "/recherche";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Résultats de recherche</h1>
        {query ? (
          <p className="text-sm text-zinc-500">Résultats pour « {query} ».</p>
        ) : (
          <p className="text-sm text-zinc-500">
            Utilise la recherche depuis l&apos;accueil ou la navigation pour trouver un club, un
            match ou un utilisateur.
          </p>
        )}
      </div>

      {noResults && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-zinc-500">
          Aucun résultat pour « {query} », même en tenant compte d&apos;éventuelles fautes de frappe.
        </div>
      )}

      {users.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Utilisateurs</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.username}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-accent/60"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold text-zinc-400">
                    {user.name.charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-medium">{user.name}</span>
                  <span className="block truncate text-xs text-zinc-500">@{user.username}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {matches.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Matchs</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} showViews />
            ))}
          </div>
        </section>
      )}

      {clubs.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Clubs</h2>
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

          {totalClubPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              {page > 1 ? (
                <Link href={clubPageHref(page - 1)} className="rounded-lg border border-border px-3 py-1.5 hover:border-accent">
                  Précédent
                </Link>
              ) : (
                <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Précédent</span>
              )}
              <span className="text-zinc-500">
                Clubs — page {page} / {totalClubPages}
              </span>
              {page < totalClubPages ? (
                <Link href={clubPageHref(page + 1)} className="rounded-lg border border-border px-3 py-1.5 hover:border-accent">
                  Suivant
                </Link>
              ) : (
                <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Suivant</span>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
