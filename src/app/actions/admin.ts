"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { Role } from "../../../generated/prisma/enums";

export async function setUserRole(userId: string, formData: FormData) {
  await requireRole("ADMIN");

  const role = formData.get("role");
  if (role !== Role.USER && role !== Role.ADMIN) return;

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function deleteUserAsAdmin(userId: string) {
  const admin = await requireRole("ADMIN");
  if (userId === admin.id) return;

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function setContactMessageRead(messageId: string, read: boolean) {
  await requireRole("ADMIN");

  await prisma.contactMessage.update({ where: { id: messageId }, data: { read } });
  revalidatePath("/admin/contact-messages");
}

export async function deleteContactMessage(messageId: string) {
  await requireRole("ADMIN");

  await prisma.contactMessage.delete({ where: { id: messageId } });
  revalidatePath("/admin/contact-messages");
}

export async function deleteMatchAsAdmin(matchId: string) {
  await requireRole("ADMIN");

  await prisma.match.delete({ where: { id: matchId } });
  revalidatePath("/admin/matches");
  revalidatePath("/");
}

export async function deleteClubAsAdmin(clubId: string) {
  await requireRole("ADMIN");

  const matchCount = await prisma.match.count({
    where: { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
  });
  if (matchCount > 0) return;

  await prisma.club.delete({ where: { id: clubId } });
  revalidatePath("/admin/clubs");
}
