"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { goalSchema } from "@/lib/validation";

const RECENT_DUPLICATE_WINDOW_MS = 90_000;

export async function findRecentGoal(matchId: string, clubId: string) {
  await requireUser();

  const recent = await prisma.goal.findFirst({
    where: { matchId, clubId, createdAt: { gte: new Date(Date.now() - RECENT_DUPLICATE_WINDOW_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (!recent) return null;

  return {
    scorerName: recent.scorerName,
    secondsAgo: Math.max(0, Math.round((Date.now() - recent.createdAt.getTime()) / 1000)),
  };
}

export async function addGoal(matchId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = goalSchema.safeParse({
    clubId: formData.get("clubId"),
    scorerName: formData.get("scorerName"),
    scorerNumber: formData.get("scorerNumber") || undefined,
    assistName: formData.get("assistName") || undefined,
    assistNumber: formData.get("assistNumber") || undefined,
    minute: formData.get("minute") || undefined,
    ownGoal: formData.get("ownGoal") === "on",
    penalty: formData.get("penalty") === "on",
  });
  if (!parsed.success) return;

  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (parsed.data.clubId !== match.homeClubId && parsed.data.clubId !== match.awayClubId) {
    return;
  }

  const ownGoal = parsed.data.ownGoal ?? false;
  // The selected club is always credited on the scoreboard — CSC is just a
  // descriptive tag, it doesn't flip the score to the opposing side.
  const scoringHome = parsed.data.clubId === match.homeClubId;

  const assistName = ownGoal ? undefined : parsed.data.assistName;
  const assistNumber = ownGoal ? undefined : parsed.data.assistNumber;
  const scorerLabel = parsed.data.scorerName || "un joueur";

  await prisma.$transaction([
    prisma.goal.create({
      data: {
        matchId,
        clubId: parsed.data.clubId,
        scorerName: parsed.data.scorerName || null,
        scorerNumber: parsed.data.scorerNumber,
        assistName,
        assistNumber,
        minute: parsed.data.minute,
        ownGoal,
        penalty: parsed.data.penalty ?? false,
        createdById: user.id,
      },
    }),
    prisma.match.update({
      where: { id: matchId },
      data: scoringHome
        ? { homeScore: { increment: 1 } }
        : { awayScore: { increment: 1 } },
    }),
    prisma.matchUpdate.create({
      data: {
        matchId,
        userId: user.id,
        type: "GOAL",
        message: `But de ${scorerLabel}${
          parsed.data.minute ? ` (${parsed.data.minute}')` : ""
        }${ownGoal ? " (csc)" : ""}${assistName ? ` sur passe de ${assistName}` : ""}`,
      },
    }),
  ]);

  revalidatePath("/matches/[slug]", "page");
  revalidatePath("/");
}

export async function updateGoal(goalId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = goalSchema.safeParse({
    clubId: formData.get("clubId"),
    scorerName: formData.get("scorerName"),
    scorerNumber: formData.get("scorerNumber") || undefined,
    assistName: formData.get("assistName") || undefined,
    assistNumber: formData.get("assistNumber") || undefined,
    minute: formData.get("minute") || undefined,
    ownGoal: formData.get("ownGoal") === "on",
    penalty: formData.get("penalty") === "on",
  });
  if (!parsed.success) return;

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  const match = await prisma.match.findUniqueOrThrow({ where: { id: goal.matchId } });
  if (parsed.data.clubId !== match.homeClubId && parsed.data.clubId !== match.awayClubId) {
    return;
  }

  const ownGoal = parsed.data.ownGoal ?? false;
  // Same rule as addGoal: the club field alone determines who is credited.
  const oldScoringHome = goal.clubId === match.homeClubId;
  const newScoringHome = parsed.data.clubId === match.homeClubId;

  const assistName = ownGoal ? undefined : parsed.data.assistName;
  const assistNumber = ownGoal ? undefined : parsed.data.assistNumber;
  const scorerLabel = parsed.data.scorerName || "un joueur";

  await prisma.$transaction([
    prisma.goal.update({
      where: { id: goalId },
      data: {
        clubId: parsed.data.clubId,
        scorerName: parsed.data.scorerName || null,
        scorerNumber: parsed.data.scorerNumber ?? null,
        assistName: assistName ?? null,
        assistNumber: assistNumber ?? null,
        minute: parsed.data.minute ?? null,
        ownGoal,
        penalty: parsed.data.penalty ?? false,
      },
    }),
    ...(oldScoringHome !== newScoringHome
      ? [
          prisma.match.update({
            where: { id: goal.matchId },
            data: oldScoringHome ? { homeScore: { decrement: 1 } } : { awayScore: { decrement: 1 } },
          }),
          prisma.match.update({
            where: { id: goal.matchId },
            data: newScoringHome ? { homeScore: { increment: 1 } } : { awayScore: { increment: 1 } },
          }),
        ]
      : []),
    prisma.matchUpdate.create({
      data: {
        matchId: goal.matchId,
        userId: user.id,
        type: "GOAL",
        message: `But de ${scorerLabel} modifié`,
      },
    }),
  ]);

  revalidatePath("/matches/[slug]", "page");
  revalidatePath("/");
}

export async function deleteGoal(goalId: string) {
  const user = await requireUser();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  await prisma.$transaction([
    prisma.goal.delete({ where: { id: goalId } }),
    prisma.matchUpdate.create({
      data: {
        matchId: goal.matchId,
        userId: user.id,
        type: "GOAL",
        message: `But de ${goal.scorerName || "un joueur"} retiré`,
      },
    }),
  ]);

  revalidatePath("/matches/[slug]", "page");
  revalidatePath("/");
}
