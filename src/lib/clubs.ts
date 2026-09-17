import "server-only";
import { prisma } from "@/lib/prisma";

export async function findOrCreateClub(name: string) {
  const trimmed = name.trim();
  const existing = await prisma.club.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing;
  return prisma.club.create({ data: { name: trimmed } });
}

export async function findOrCreateFffClub(fffId: string, name: string) {
  const existing = await prisma.club.findUnique({ where: { fffId } });
  if (existing) return existing;
  return prisma.club.create({ data: { name: name.trim(), fffId } });
}
