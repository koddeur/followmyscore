"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { lineupEntrySchema } from "@/lib/validation";

export async function saveLineup(matchId: string, clubId: string, formData: FormData) {
  const user = await requireUser();

  const formation = (formData.get("formation") as string | null)?.trim() || null;
  const raw = formData.get("entries");

  let rawEntries: unknown;
  try {
    rawEntries = JSON.parse(typeof raw === "string" ? raw : "[]");
  } catch {
    return;
  }

  const parsed = z.array(lineupEntrySchema).max(30).safeParse(rawEntries);
  if (!parsed.success) return;

  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (clubId !== match.homeClubId && clubId !== match.awayClubId) return;

  await prisma.$transaction(async (tx) => {
    const lineup = await tx.lineup.upsert({
      where: { matchId_clubId: { matchId, clubId } },
      create: { matchId, clubId, formation, createdById: user.id },
      update: { formation },
    });

    await tx.lineupEntry.deleteMany({ where: { lineupId: lineup.id } });

    if (parsed.data.length > 0) {
      await tx.lineupEntry.createMany({
        data: parsed.data.map((entry) => ({
          lineupId: lineup.id,
          playerName: entry.playerName,
          number: entry.number,
          position: entry.position,
          isStarting: entry.isStarting ?? true,
        })),
      });
    }

    await tx.matchUpdate.create({
      data: {
        matchId,
        userId: user.id,
        type: "LINEUP",
        message: "Composition mise à jour",
      },
    });
  });

  revalidatePath(`/matches/${matchId}`);
}
