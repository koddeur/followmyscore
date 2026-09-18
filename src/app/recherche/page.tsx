import Link from "next/link";
import { searchClubs, countClubSearch } from "@/lib/clubSearch";
import { searchMatches } from "@/lib/matchSearch";
import { searchUsers } from "@/lib/userSearch";
import { ClubLogo } from "@/components/ClubLogo";
import { MatchCard } from "@/components/MatchCard";
import { SearchTypeFilter, isSearchType, type SearchType } from "@/components/SearchTypeFilter";
import { STATUS_PRIORITY } from "@/lib/matchStatus";

const CLUB_PAGE_SIZE = 24;
const FOCUSED_LIMIT = 30;
const TOP_LIMIT = 3;

export const metadata = {
  title: "Résultats de recherche — FollowMyScore",
  description: "Retrouve les clubs, matchs et utilisateurs correspondant à ta recherche.",
};

function UserRow({ user }: { user: { id: string; username: string; name: string; avatarUrl: string | null } }) {
  return (
    <Link
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
  );
}

function ClubRow({
  club,
}: {
  club: { id: string; fffId: string | null; name: string; logoUrl: string | null; city: string | null };
}) {
  return (
    <Link
      href={`/clubs/${club.fffId ?? club.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-accent/60"
    >
      <ClubLogo logoUrl={club.logoUrl} name={club.name} className="h-9 w-9" />
      <span className="min-w-0">
        <span className="block truncate font-medium">{club.name}</span>
        {club.city && <span className="block truncate text-xs text-zinc-500">{club.city}</span>}
      </span>
    </Link>
  );
}

export default async function RecherchePage({ searchParams }: PageProps<"/recherche">) {
  const { q, page: pageParam, type: typeParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = Math.max(1, Number(pageParam) || 1);
  const typeFilter: SearchType | null =
    typeof typeParam === "string" && isSearchType(typeParam) ? typeParam : null;
  const showAll = typeFilter === null;

  const clubLimit = typeFilter === "clubs" ? CLUB_PAGE_SIZE : TOP_LIMIT;
  const otherLimit = showAll ? TOP_LIMIT : FOCUSED_LIMIT;

  const [clubs, clubTotal, matches, users] = query.length
    ? await Promise.all([
        searchClubs(query, { limit: clubLimit, offset: typeFilter === "clubs" ? (page - 1) * CLUB_PAGE_SIZE : 0 }),
        typeFilter === "clubs" ? countClubSearch(query) : Promise.resolve(0),
        showAll || typeFilter === "matches" ? searchMatches(query, otherLimit) : Promise.resolve([]),
        showAll || typeFilter === "users" ? searchUsers(query, otherLimit) : Promise.resolve([]),
      ])
    : [[], 0, [], []];

  matches.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const totalClubPages = Math.max(1, Math.ceil(clubTotal / CLUB_PAGE_SIZE));
  const noResults = query.length > 0 && clubs.length === 0 && matches.length === 0 && users.length === 0;

  function clubPageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("type", "clubs");
    if (p > 1) params.set("page", String(p));
    return `/recherche?${params.toString()}`;
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

      {query.length > 0 && <SearchTypeFilter query={query} active={typeFilter} />}

      {noResults && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-zinc-500">
          Aucun résultat pour « {query} », même en tenant compte d&apos;éventuelles fautes de frappe.
        </div>
      )}

      {showAll ? (
        <>
          {(users.length > 0 || matches.length > 0 || clubs.length > 0) && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Top résultats</h2>
              <div className="space-y-5">
                {users.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-zinc-500">Utilisateurs</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {users.map((user) => (
                        <UserRow key={user.id} user={user} />
                      ))}
                    </div>
                  </div>
                )}
                {matches.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-zinc-500">Matchs</h3>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {matches.map((match) => (
                        <MatchCard key={match.id} match={match} showViews />
                      ))}
                    </div>
                  </div>
                )}
                {clubs.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-zinc-500">Clubs</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {clubs.map((club) => (
                        <ClubRow key={club.id} club={club} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          {typeFilter === "users" && users.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Utilisateurs</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}

          {typeFilter === "matches" && matches.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Matchs</h2>
              <div className="grid gap-3 lg:grid-cols-2">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} showViews />
                ))}
              </div>
            </section>
          )}

          {typeFilter === "clubs" && clubs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Clubs</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {clubs.map((club) => (
                  <ClubRow key={club.id} club={club} />
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
                    Page {page} / {totalClubPages}
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
        </>
      )}
    </div>
  );
}
