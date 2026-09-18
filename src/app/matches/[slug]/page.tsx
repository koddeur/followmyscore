import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/dal";
import { StatusBadge, STATUS_LABELS } from "@/components/StatusBadge";
import { StatusControls } from "@/components/StatusControls";
import { GoalsList } from "@/components/GoalsList";
import { CardsList } from "@/components/CardsList";
import { SubstitutionsList } from "@/components/SubstitutionsList";
import { MatchEvents } from "@/components/MatchEvents";
import { LineupEditor } from "@/components/LineupEditor";
import { LineupView } from "@/components/LineupView";
import { Timeline } from "@/components/Timeline";
import { CommentSection } from "@/components/CommentSection";
import { LiveRefresher } from "@/components/LiveRefresher";
import { MatchInfoForm } from "@/components/MatchInfoForm";
import { DeleteMatchButton } from "@/components/DeleteMatchButton";
import { ShareButtons } from "@/components/ShareButtons";
import { ClubLogo } from "@/components/ClubLogo";
import { MatchViewTracker } from "@/components/MatchViewTracker";
import { MatchHeaderEvents, type MatchHeaderEventItem } from "@/components/MatchHeaderEvents";
import { RecentEventHighlight } from "@/components/RecentEventHighlight";
import { FollowMatchButton } from "@/components/FollowMatchButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/matches/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  const match = await prisma.match.findUnique({
    where: { slug },
    include: { homeClub: true, awayClub: true },
  });

  if (!match) return {};

  const hasScore = match.status === "LIVE" || match.status === "HALFTIME" || match.status === "INTERRUPTED" || match.status === "FINISHED";
  const title = hasScore
    ? `${match.homeClub.name} ${match.homeScore} - ${match.awayScore} ${match.awayClub.name}`
    : `${match.homeClub.name} vs ${match.awayClub.name}`;

  const descriptionParts = [STATUS_LABELS[match.status]];
  if (match.competition) descriptionParts.push(match.competition);
  if (match.venue) descriptionParts.push(match.venue);
  if (match.kickoffAt) {
    descriptionParts.push(format(match.kickoffAt, "d MMMM yyyy 'à' HH:mm", { locale: fr }));
  }
  const description = descriptionParts.join(" · ");

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const url = host ? `${protocol}://${host}/matches/${match.slug}` : undefined;

  return {
    title: `${title} — FollowMyScore`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "FollowMyScore",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MatchPage({ params }: PageProps<"/matches/[slug]">) {
  const { slug } = await params;

  const match = await prisma.match.findUnique({
    where: { slug },
    include: {
      homeClub: true,
      awayClub: true,
      goals: { include: { club: true } },
      cards: { include: { club: true } },
      substitutions: { include: { club: true } },
      lineups: { include: { entries: true } },
      updates: { include: { user: true }, orderBy: { createdAt: "desc" } },
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!match) notFound();

  const user = await getCurrentUser();
  const isAdmin = user ? hasRole(user.role, "ADMIN") : false;
  const clubNames = isAdmin
    ? (
        await prisma.club.findMany({
          orderBy: { name: "asc" },
          select: { name: true },
          distinct: ["name"],
        })
      ).map((c) => c.name)
    : [];

  const [followerCount, isFollowing] = await Promise.all([
    prisma.matchFollower.count({ where: { matchId: match.id } }),
    user
      ? prisma.matchFollower
          .findUnique({ where: { matchId_userId: { matchId: match.id, userId: user.id } } })
          .then((f) => f !== null)
      : Promise.resolve(false),
  ]);

  const homeLineup = match.lineups.find((l) => l.clubId === match.homeClubId) ?? null;
  const awayLineup = match.lineups.find((l) => l.clubId === match.awayClubId) ?? null;

  const started = match.startedAt !== null;
  const ended = match.status === "FINISHED";
  const isHalftime = match.status === "HALFTIME";
  const homeLineupEntries = homeLineup?.entries.map((e) => ({ playerName: e.playerName, number: e.number })) ?? [];
  const awayLineupEntries = awayLineup?.entries.map((e) => ({ playerName: e.playerName, number: e.number })) ?? [];

  function clubEvents(clubId: string): MatchHeaderEventItem[] {
    const goalItems: MatchHeaderEventItem[] = match!.goals
      .filter((g) => g.club.id === clubId)
      .map((g) => ({
        id: g.id,
        kind: "goal",
        minute: g.minute,
        playerName: g.scorerName,
        playerNumber: g.scorerNumber,
        ownGoal: g.ownGoal,
        penalty: g.penalty,
        createdAt: g.createdAt,
      }));
    const cardItems: MatchHeaderEventItem[] = match!.cards
      .filter((c) => c.club.id === clubId)
      .map((c) => ({
        id: c.id,
        kind: c.type === "YELLOW" ? "yellow" : "red",
        minute: c.minute,
        playerName: c.playerName,
        playerNumber: c.number,
        createdAt: c.createdAt,
      }));
    const substitutionItems: MatchHeaderEventItem[] = match!.substitutions
      .filter((s) => s.club.id === clubId)
      .map((s) => ({
        id: s.id,
        kind: "substitution",
        minute: s.minute,
        playerName: s.playerInName,
        playerNumber: s.playerInNumber,
        createdAt: s.createdAt,
      }));
    return [...goalItems, ...cardItems, ...substitutionItems];
  }

  const homeEvents = clubEvents(match.homeClubId);
  const awayEvents = clubEvents(match.awayClubId);

  function lastGoalAt(clubId: string): Date {
    const clubGoals = match!.goals.filter((g) => g.club.id === clubId);
    if (clubGoals.length === 0) return new Date(0);
    return clubGoals.reduce((latest, g) => (g.createdAt > latest ? g.createdAt : latest), clubGoals[0].createdAt);
  }

  const lastHomeGoalAt = lastGoalAt(match.homeClubId);
  const lastAwayGoalAt = lastGoalAt(match.awayClubId);

  return (
    <div className="space-y-8">
      <LiveRefresher status={match.status} />
      <MatchViewTracker matchId={match.id} />

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="relative gap-2 pr-14 text-xs text-zinc-500 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:pr-0">
          {/* Mobile: competition + date on one row, venue on its own row below */}
          <div className="flex flex-col gap-1 sm:hidden">
            {(match.competition || match.kickoffAt) && (
              <div className="flex items-center gap-2">
                {match.competition && <span>{match.competition}</span>}
                {match.kickoffAt && (
                  <span>
                    {match.competition && "· "}
                    {format(match.kickoffAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                )}
              </div>
            )}
            {match.venue && <div>{match.venue}</div>}
          </div>

          {/* Desktop: single inline line with separators */}
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {match.competition && <span>{match.competition}</span>}
            {match.venue && <span>{match.competition && "· "}{match.venue}</span>}
            {match.kickoffAt && (
              <span>
                {(match.competition || match.venue) && "· "}
                {format(match.kickoffAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            )}
          </div>

          <span
            className="absolute right-0 top-0 flex shrink-0 items-center gap-1 sm:static"
            title="Nombre de vues"
          >
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
        </div>

        {isAdmin && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <MatchInfoForm
              matchId={match.id}
              clubNames={clubNames}
              initial={{
                homeClubName: match.homeClub.name,
                awayClubName: match.awayClub.name,
                competition: match.competition,
                venue: match.venue,
                kickoffAt: match.kickoffAt,
              }}
            />
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <StatusBadge status={match.status} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 overflow-hidden sm:gap-3">
            <span className="min-w-0 truncate text-right text-sm font-semibold sm:text-xl">
              {match.homeClub.name}
            </span>
            <Link href={`/clubs/${match.homeClub.fffId ?? match.homeClub.id}`} className="shrink-0">
              <ClubLogo logoUrl={match.homeClub.logoUrl} name={match.homeClub.name} className="h-7 w-7 sm:h-12 sm:w-12" />
            </Link>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-xl bg-background px-2.5 py-1.5 font-mono text-xl font-bold tabular-nums sm:px-4 sm:py-2 sm:text-3xl">
            <RecentEventHighlight
              key={lastHomeGoalAt.getTime()}
              createdAt={lastHomeGoalAt}
              className="rounded-md px-1"
              highlightClassName="bg-accent/20 text-accent"
              idleClassName=""
            >
              {match.homeScore}
            </RecentEventHighlight>
            <span>–</span>
            <RecentEventHighlight
              key={lastAwayGoalAt.getTime()}
              createdAt={lastAwayGoalAt}
              className="rounded-md px-1"
              highlightClassName="bg-accent/20 text-accent"
              idleClassName=""
            >
              {match.awayScore}
            </RecentEventHighlight>
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden sm:gap-3">
            <Link href={`/clubs/${match.awayClub.fffId ?? match.awayClub.id}`} className="shrink-0">
              <ClubLogo logoUrl={match.awayClub.logoUrl} name={match.awayClub.name} className="h-7 w-7 sm:h-12 sm:w-12" />
            </Link>
            <span className="min-w-0 truncate text-sm font-semibold sm:text-xl">{match.awayClub.name}</span>
          </div>
        </div>

        {(homeEvents.length > 0 || awayEvents.length > 0) && (
          <div className="mt-3 flex items-start justify-between gap-6 sm:gap-8">
            <div className="min-w-0 flex-1">
              <MatchHeaderEvents items={homeEvents} align="right" />
            </div>
            <div className="min-w-0 flex-1">
              <MatchHeaderEvents items={awayEvents} align="left" />
            </div>
          </div>
        )}

        <div className="mt-8">
          <ShareButtons title={`${match.homeClub.name} vs ${match.awayClub.name}`} />
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-sm text-zinc-500">
            {followerCount === 0
              ? "Personne n'est éditeur sur ce match pour l'instant."
              : `${followerCount} personne${followerCount > 1 ? "s" : ""} ${
                  followerCount > 1 ? "sont" : "est"
                } éditeur${followerCount > 1 ? "s" : ""} sur ce match.`}
          </p>

          {!user && (
            <p className="mt-3 text-sm text-zinc-500">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/matches/${match.slug}`)}`}
                className="font-medium text-accent hover:underline"
              >
                Connecte-toi
              </Link>{" "}
              pour participer à la gestion de ce match.
            </p>
          )}

          {user && !isFollowing && (
            <div className="mt-3">
              <FollowMatchButton matchId={match.id} isFollowing={false} />
            </div>
          )}

          {user && isFollowing && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-end">
                <FollowMatchButton matchId={match.id} isFollowing />
              </div>
              <MatchEvents
                matchId={match.id}
                homeClub={match.homeClub}
                awayClub={match.awayClub}
                homeLineupEntries={homeLineupEntries}
                awayLineupEntries={awayLineupEntries}
                started={started}
                ended={ended}
                isHalftime={isHalftime}
              />
              <div className="flex justify-center">
                <StatusControls key={match.status} matchId={match.id} status={match.status} />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Buts</h2>
        <GoalsList
          goals={match.goals}
          homeClub={match.homeClub}
          awayClub={match.awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          canEdit={isFollowing}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Cartons</h2>
        <CardsList
          cards={match.cards}
          homeClub={match.homeClub}
          awayClub={match.awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          canEdit={isFollowing}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Changements</h2>
        <SubstitutionsList
          substitutions={match.substitutions}
          homeClub={match.homeClub}
          awayClub={match.awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          canEdit={isFollowing}
        />
      </section>

      <section className="grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div>
          <LineupView clubName={match.homeClub.name} lineup={homeLineup} />
          {isFollowing && (
            <div className="mt-3 border-t border-border pt-3">
              <LineupEditor
                matchId={match.id}
                clubId={match.homeClubId}
                clubName={match.homeClub.name}
                initial={homeLineup}
              />
            </div>
          )}
        </div>
        <div>
          <LineupView clubName={match.awayClub.name} lineup={awayLineup} />
          {isFollowing && (
            <div className="mt-3 border-t border-border pt-3">
              <LineupEditor
                matchId={match.id}
                clubId={match.awayClubId}
                clubName={match.awayClub.name}
                initial={awayLineup}
              />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Suivi des mises à jour</h2>
        <Timeline entries={match.updates} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Commentaires</h2>
        <CommentSection
          matchId={match.id}
          matchSlug={match.slug}
          comments={match.comments}
          currentUserId={user?.id ?? null}
          isAdmin={isAdmin}
        />
      </section>

      {isAdmin && (
        <section className="rounded-2xl border border-red-200 bg-card p-6 dark:border-red-900">
          <h2 className="mb-3 text-lg font-semibold">Zone de danger</h2>
          <DeleteMatchButton
            matchId={match.id}
            label={`${match.homeClub.name} vs ${match.awayClub.name}`}
          />
        </section>
      )}
    </div>
  );
}
