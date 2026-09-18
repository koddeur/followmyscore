"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export async function followMatch(matchId: string) {
  const user = await requireUser();

  await prisma.matchFollower.upsert({
    where: { matchId_userId: { matchId, userId: user.id } },
    update: {},
    create: { matchId, userId: user.id },
  });

  revalidatePath("/matches/[slug]", "page");
}

export async function unfollowMatch(matchId: string) {
  const user = await requireUser();

  await prisma.matchFollower.deleteMany({ where: { matchId, userId: user.id } });

  revalidatePath("/matches/[slug]", "page");
}
