"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { substitutionSchema } from "@/lib/validation";

const RECENT_DUPLICATE_WINDOW_MS = 90_000;

export async function findRecentSubstitution(matchId: string, clubId: string) {
  await requireUser();

  const recent = await prisma.substitution.findFirst({
    where: { matchId, clubId, createdAt: { gte: new Date(Date.now() - RECENT_DUPLICATE_WINDOW_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (!recent) return null;

  return {
    playerInName: recent.playerInName,
    playerOutName: recent.playerOutName,
    secondsAgo: Math.max(0, Math.round((Date.now() - recent.createdAt.getTime()) / 1000)),
  };
}

export async function addSubstitution(matchId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = substitutionSchema.safeParse({
    clubId: formData.get("clubId"),
    playerInName: formData.get("playerInName"),
    playerInNumber: formData.get("playerInNumber") || undefined,
    playerOutName: formData.get("playerOutName"),
    playerOutNumber: formData.get("playerOutNumber") || undefined,
    minute: formData.get("minute") || undefined,
  });
  if (!parsed.success) return;

  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (parsed.data.clubId !== match.homeClubId && parsed.data.clubId !== match.awayClubId) {
    return;
  }

  const inLabel = parsed.data.playerInName || "un joueur";
  const outLabel = parsed.data.playerOutName;

  await prisma.$transaction([
    prisma.substitution.create({
      data: {
        matchId,
        clubId: parsed.data.clubId,
        playerInName: parsed.data.playerInName || null,
        playerInNumber: parsed.data.playerInNumber,
        playerOutName: parsed.data.playerOutName || null,
        playerOutNumber: parsed.data.playerOutNumber,
        minute: parsed.data.minute,
        createdById: user.id,
      },
    }),
    prisma.matchUpdate.create({
      data: {
        matchId,
        userId: user.id,
        type: "SUBSTITUTION",
        message: `Changement : ${inLabel} entre${outLabel ? ` à la place de ${outLabel}` : ""}${
          parsed.data.minute ? ` (${parsed.data.minute}')` : ""
        }`,
      },
    }),
  ]);

  revalidatePath(`/matches/${matchId}`);
}

export async function updateSubstitution(substitutionId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = substitutionSchema.safeParse({
    clubId: formData.get("clubId"),
    playerInName: formData.get("playerInName"),
    playerInNumber: formData.get("playerInNumber") || undefined,
    playerOutName: formData.get("playerOutName"),
    playerOutNumber: formData.get("playerOutNumber") || undefined,
    minute: formData.get("minute") || undefined,
  });
  if (!parsed.success) return;

  const substitution = await prisma.substitution.findUnique({ where: { id: substitutionId } });
  if (!substitution) return;

  const match = await prisma.match.findUniqueOrThrow({ where: { id: substitution.matchId } });
  if (parsed.data.clubId !== match.homeClubId && parsed.data.clubId !== match.awayClubId) {
    return;
  }

  const inLabel = parsed.data.playerInName || "un joueur";

  await prisma.$transaction([
    prisma.substitution.update({
      where: { id: substitutionId },
      data: {
        clubId: parsed.data.clubId,
        playerInName: parsed.data.playerInName || null,
        playerInNumber: parsed.data.playerInNumber ?? null,
        playerOutName: parsed.data.playerOutName || null,
        playerOutNumber: parsed.data.playerOutNumber ?? null,
        minute: parsed.data.minute ?? null,
      },
    }),
    prisma.matchUpdate.create({
      data: {
        matchId: substitution.matchId,
        userId: user.id,
        type: "SUBSTITUTION",
        message: `Changement pour ${inLabel} modifié`,
      },
    }),
  ]);

  revalidatePath(`/matches/${substitution.matchId}`);
}

export async function deleteSubstitution(substitutionId: string) {
  const user = await requireUser();

  const substitution = await prisma.substitution.findUnique({ where: { id: substitutionId } });
  if (!substitution) return;

  await prisma.$transaction([
    prisma.substitution.delete({ where: { id: substitutionId } }),
    prisma.matchUpdate.create({
      data: {
        matchId: substitution.matchId,
        userId: user.id,
        type: "SUBSTITUTION",
        message: `Changement pour ${substitution.playerInName || "un joueur"} retiré`,
      },
    }),
  ]);

  revalidatePath(`/matches/${substitution.matchId}`);
}
