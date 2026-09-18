"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/dal";
import { findOrCreateClub } from "@/lib/clubs";
import { generateMatchSlug } from "@/lib/matchSlug";
import {
  createMatchSchema,
  endMatchSchema,
  startMatchSchema,
  statusUpdateSchema,
} from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

export async function createMatch(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = createMatchSchema.safeParse({
    homeClubName: formData.get("homeClubName"),
    awayClubName: formData.get("awayClubName"),
    competition: formData.get("competition") || undefined,
    venue: formData.get("venue") || undefined,
    kickoffAt: formData.get("kickoffAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { homeClubName, awayClubName, competition, venue, kickoffAt } = parsed.data;

  if (homeClubName.trim().toLowerCase() === awayClubName.trim().toLowerCase()) {
    return { error: "Les deux équipes doivent être différentes." };
  }

  const [homeClub, awayClub] = await Promise.all([
    findOrCreateClub(homeClubName),
    findOrCreateClub(awayClubName),
  ]);

  const kickoffDate = kickoffAt ? new Date(kickoffAt) : new Date();
  const slug = await generateMatchSlug(homeClub.name, awayClub.name, kickoffDate);

  const match = await prisma.match.create({
    data: {
      slug,
      homeClubId: homeClub.id,
      awayClubId: awayClub.id,
      competition: competition || null,
      venue: venue || null,
      kickoffAt: kickoffAt ? new Date(kickoffAt) : null,
      source: "MANUAL",
      createdById: user.id,
      updates: {
        create: {
          userId: user.id,
          type: "NOTE",
          message: "Match créé",
        },
      },
    },
  });

  redirect(`/matches/${match.slug}`);
}

export async function updateMatchInfo(matchId: string, formData: FormData) {
  const user = await requireRole("ADMIN");

  const parsed = createMatchSchema.safeParse({
    homeClubName: formData.get("homeClubName"),
    awayClubName: formData.get("awayClubName"),
    competition: formData.get("competition") || undefined,
    venue: formData.get("venue") || undefined,
    kickoffAt: formData.get("kickoffAt") || undefined,
  });
  if (!parsed.success) return;

  const { homeClubName, awayClubName, competition, venue, kickoffAt } = parsed.data;
  if (homeClubName.trim().toLowerCase() === awayClubName.trim().toLowerCase()) {
    return;
  }

  const [homeClub, awayClub] = await Promise.all([
    findOrCreateClub(homeClubName),
    findOrCreateClub(awayClubName),
  ]);

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: {
        homeClubId: homeClub.id,
        awayClubId: awayClub.id,
        competition: competition || null,
        venue: venue || null,
        kickoffAt: kickoffAt ? new Date(kickoffAt) : null,
      },
    }),
    prisma.matchUpdate.create({
      data: {
        matchId,
        userId: user.id,
        type: "NOTE",
        message: "Infos du match modifiées",
      },
    }),
  ]);

  revalidatePath("/matches/[slug]", "page");
  revalidatePath("/");
}

export async function startMatch(matchId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = startMatchSchema.safeParse({ startedAt: formData.get("startedAt") });
  if (!parsed.success) return;

  const startedAt = new Date(parsed.data.startedAt);
  if (Number.isNaN(startedAt.getTime())) return;

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: { startedAt, status: "LIVE" },
    }),
    prisma.matchUpdate.create({
      data: { matchId, userId: user.id, type: "STATUS", status: "LIVE" },
    }),
  ]);

  revalidatePath("/matches/[slug]", "page");
  revalidatePath("/");
}

export async function endMatch(matchId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = endMatchSchema.safeParse({ endedAt: formData.get("endedAt") });
  if (!parsed.success) return;

  const endedAt = new Date(parsed.data.endedAt);
  if (Number.isNaN(endedAt.getTime())) return;

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: { endedAt, status: "FINISHED" },
    }),
    prisma.matchUpdate.create({
      data: { matchId, userId: user.id, type: "STATUS", status: "FINISHED" },
    }),
  ]);

  revalidatePath("/matches/[slug]", "page");
  revalidatePath("/");
}

export async function updateStatus(matchId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = statusUpdateSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: { status: parsed.data.status },
    }),
    prisma.matchUpdate.create({
      data: {
        matchId,
        userId: user.id,
        type: "STATUS",
        status: parsed.data.status,
      },
    }),
  ]);

  revalidatePath("/matches/[slug]", "page");
  revalidatePath("/");
}

export async function incrementMatchView(matchId: string) {
  await prisma.match.update({
    where: { id: matchId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function deleteMatch(matchId: string) {
  await requireRole("ADMIN");

  await prisma.match.delete({ where: { id: matchId } });

  revalidatePath("/");
  redirect("/");
}
