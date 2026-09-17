import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { MatchCard } from "@/components/MatchCard";
import { STATUS_PRIORITY } from "@/lib/matchStatus";

export default async function UserPage({ params }: PageProps<"/users/[username]">) {
  const { username } = await params;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) notFound();

  const sessionUser = await getCurrentUser();
  const isOwnProfile = sessionUser?.id === user.id;

  const [commentCount, createdMatches, goalMatches, cardMatches, substitutionMatches] = await Promise.all([
    prisma.comment.count({ where: { userId: user.id } }),
    prisma.match.findMany({
      where: { createdById: user.id },
      include: { homeClub: true, awayClub: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.goal.findMany({ where: { createdById: user.id }, select: { matchId: true }, distinct: ["matchId"] }),
    prisma.card.findMany({ where: { createdById: user.id }, select: { matchId: true }, distinct: ["matchId"] }),
    prisma.substitution.findMany({
      where: { createdById: user.id },
      select: { matchId: true },
      distinct: ["matchId"],
    }),
  ]);

  createdMatches.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const contributionMatchIds = new Set([
    ...goalMatches.map((g) => g.matchId),
    ...cardMatches.map((c) => c.matchId),
    ...substitutionMatches.map((s) => s.matchId),
  ]);
  const contributionCount = contributionMatchIds.size;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background text-2xl font-semibold text-zinc-400">
            {user.name.charAt(0)}
          </span>
        )}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{user.name}</h1>
        <p className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          @{user.username}
          {user.role === "ADMIN" && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              Admin
            </span>
          )}
        </p>

        {isOwnProfile && (
          <Link
            href="/account"
            className="mt-3 inline-block rounded-full border border-border px-3.5 py-1.5 text-sm font-medium hover:border-accent"
          >
            Mettre à jour mes informations
          </Link>
        )}

        <div className="mt-4 flex items-center justify-center gap-8">
          <div>
            <p className="text-lg font-semibold tabular-nums">{commentCount}</p>
            <p className="text-xs text-zinc-500">Commentaire{commentCount > 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">{createdMatches.length}</p>
            <p className="text-xs text-zinc-500">
              Match{createdMatches.length > 1 ? "s" : ""} créé{createdMatches.length > 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">{contributionCount}</p>
            <p className="text-xs text-zinc-500">Contribution{contributionCount > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Matchs créés</h2>
        {createdMatches.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun match créé pour le moment.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {createdMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
