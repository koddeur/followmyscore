"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { findOrCreateFffClub } from "@/lib/clubs";
import {
  getFffClubCategories,
  getFffTeamMatchSummaries,
  isFffEnabled,
  type FffMatchSummary,
  type FffTeamOption,
} from "@/lib/fff";

export interface FffClubOption {
  id: string;
  fffId: string;
  name: string;
  logoUrl: string | null;
}

export async function searchFffClubs(query: string): Promise<FffClubOption[]> {
  await requireUser("/login?callbackUrl=/matches/new");

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const clubs = await prisma.club.findMany({
    where: { fffId: { not: null }, name: { contains: trimmed, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 10,
    select: { id: true, fffId: true, name: true, logoUrl: true },
  });

  return clubs
    .filter((c): c is typeof c & { fffId: string } => c.fffId !== null)
    .map((c) => ({ id: c.id, fffId: c.fffId, name: c.name, logoUrl: c.logoUrl }));
}

export async function lookupFffCategories(fffClubId: string): Promise<FffTeamOption[] | null> {
  await requireUser("/login?callbackUrl=/matches/new");

  if (!isFffEnabled()) return null;

  return getFffClubCategories(fffClubId);
}

export interface FffMatchOption extends FffMatchSummary {
  homeClubLogoUrl: string | null;
  awayClubLogoUrl: string | null;
}

export async function lookupFffMatches(
  fffClubId: string,
  teamNumber: string
): Promise<FffMatchOption[] | null> {
  await requireUser("/login?callbackUrl=/matches/new");

  if (!isFffEnabled()) return null;

  const matches = await getFffTeamMatchSummaries(fffClubId, teamNumber);
  if (!matches) return null;

  // Strictly in the future: kickoff later than "now + 1 day", not just later than now.
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const upcoming = matches
    .filter((m) => !m.isFinished && m.kickoffAt !== null && new Date(m.kickoffAt) > cutoff)
    .sort((a, b) => {
      const aTime = a.kickoffAt ? new Date(a.kickoffAt).getTime() : 0;
      const bTime = b.kickoffAt ? new Date(b.kickoffAt).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, 15);

  const fffIds = Array.from(
    new Set(upcoming.flatMap((m) => [m.homeClubFffId, m.awayClubFffId]))
  );
  const clubs = await prisma.club.findMany({
    where: { fffId: { in: fffIds } },
    select: { fffId: true, logoUrl: true },
  });
  const logoByFffId = new Map(clubs.map((c) => [c.fffId, c.logoUrl]));

  return upcoming.map((m) => ({
    ...m,
    homeClubLogoUrl: logoByFffId.get(m.homeClubFffId) ?? null,
    awayClubLogoUrl: logoByFffId.get(m.awayClubFffId) ?? null,
  }));
}

export async function importFffMatch(
  summary: FffMatchSummary
): Promise<{ matchId: string } | { error: string }> {
  const user = await requireUser("/login?callbackUrl=/matches/new");

  const existing = await prisma.match.findUnique({ where: { fffId: summary.fffId } });
  if (existing) {
    return { matchId: existing.id };
  }

  const [homeClub, awayClub] = await Promise.all([
    findOrCreateFffClub(summary.homeClubFffId, summary.homeClubName),
    findOrCreateFffClub(summary.awayClubFffId, summary.awayClubName),
  ]);

  const match = await prisma.match.create({
    data: {
      homeClubId: homeClub.id,
      awayClubId: awayClub.id,
      competition: summary.competition,
      venue: summary.venue,
      kickoffAt: summary.kickoffAt ? new Date(summary.kickoffAt) : null,
      source: "FFF",
      fffId: summary.fffId,
      status: summary.isPostponed ? "POSTPONED" : "SCHEDULED",
      createdById: user.id,
      updates: {
        create: {
          userId: user.id,
          type: "NOTE",
          message: "Match importé depuis la FFF",
        },
      },
    },
  });

  return { matchId: match.id };
}
