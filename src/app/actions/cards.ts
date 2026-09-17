"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { cardSchema, cardEditSchema } from "@/lib/validation";

const RECENT_DUPLICATE_WINDOW_MS = 90_000;

export async function findRecentCard(matchId: string, clubId: string, type: "YELLOW" | "RED") {
  await requireUser();

  const recent = await prisma.card.findFirst({
    where: {
      matchId,
      clubId,
      type,
      createdAt: { gte: new Date(Date.now() - RECENT_DUPLICATE_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!recent) return null;

  return {
    playerName: recent.playerName,
    secondsAgo: Math.max(0, Math.round((Date.now() - recent.createdAt.getTime()) / 1000)),
  };
}

export async function addCard(matchId: string, cardType: "YELLOW" | "RED", formData: FormData) {
  const user = await requireUser();

  const parsed = cardSchema.safeParse({
    clubId: formData.get("clubId"),
    playerName: formData.get("playerName"),
    playerNumber: formData.get("playerNumber") || undefined,
    minute: formData.get("minute") || undefined,
  });
  if (!parsed.success) return;

  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (parsed.data.clubId !== match.homeClubId && parsed.data.clubId !== match.awayClubId) {
    return;
  }

  const label = cardType === "YELLOW" ? "Carton jaune" : "Carton rouge";
  const playerLabel = parsed.data.playerName || "un joueur";

  await prisma.$transaction([
    prisma.card.create({
      data: {
        matchId,
        clubId: parsed.data.clubId,
        playerName: parsed.data.playerName || null,
        number: parsed.data.playerNumber,
        type: cardType,
        minute: parsed.data.minute,
        createdById: user.id,
      },
    }),
    prisma.matchUpdate.create({
      data: {
        matchId,
        userId: user.id,
        type: "CARD",
        message: `${label} pour ${playerLabel}${
          parsed.data.minute ? ` (${parsed.data.minute}')` : ""
        }`,
      },
    }),
  ]);

  revalidatePath(`/matches/${matchId}`);
}

export async function updateCard(cardId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = cardEditSchema.safeParse({
    clubId: formData.get("clubId"),
    playerName: formData.get("playerName"),
    playerNumber: formData.get("playerNumber") || undefined,
    minute: formData.get("minute") || undefined,
    type: formData.get("type"),
  });
  if (!parsed.success) return;

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return;

  const match = await prisma.match.findUniqueOrThrow({ where: { id: card.matchId } });
  if (parsed.data.clubId !== match.homeClubId && parsed.data.clubId !== match.awayClubId) {
    return;
  }

  const label = parsed.data.type === "YELLOW" ? "Carton jaune" : "Carton rouge";
  const playerLabel = parsed.data.playerName || "un joueur";

  await prisma.$transaction([
    prisma.card.update({
      where: { id: cardId },
      data: {
        clubId: parsed.data.clubId,
        playerName: parsed.data.playerName || null,
        number: parsed.data.playerNumber ?? null,
        minute: parsed.data.minute ?? null,
        type: parsed.data.type,
      },
    }),
    prisma.matchUpdate.create({
      data: {
        matchId: card.matchId,
        userId: user.id,
        type: "CARD",
        message: `${label} pour ${playerLabel} modifié`,
      },
    }),
  ]);

  revalidatePath(`/matches/${card.matchId}`);
}

export async function deleteCard(cardId: string) {
  const user = await requireUser();

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return;

  const label = card.type === "YELLOW" ? "Carton jaune" : "Carton rouge";

  await prisma.$transaction([
    prisma.card.delete({ where: { id: cardId } }),
    prisma.matchUpdate.create({
      data: {
        matchId: card.matchId,
        userId: user.id,
        type: "CARD",
        message: `${label} pour ${card.playerName || "un joueur"} retiré`,
      },
    }),
  ]);

  revalidatePath(`/matches/${card.matchId}`);
}
