"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { Role } from "../../../generated/prisma/enums";
import { getFffClubsPage, isFffEnabled } from "@/lib/fff";

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

const FFF_SYNC_PAGE_DELAY_MS = 150;

export type FffClubSyncResult =
  | { error: string }
  | { upserted: number; pages: number };

/**
 * Pulls the full FFF club directory page by page and upserts every entry by
 * fffId, refreshing name/shortName/city/postalCode/district/coordinates on
 * clubs that already exist (e.g. from a match import).
 */
export async function syncFffClubs(): Promise<FffClubSyncResult> {
  await requireRole("ADMIN");

  if (!isFffEnabled()) {
    return {
      error:
        "L'intégration FFF est désactivée (FFF_API_ENABLED n'est pas à true dans .env).",
    };
  }

  let page = 1;
  let upserted = 0;

  for (;;) {
    const items = await getFffClubsPage(page);
    if (items === null) {
      return {
        error: `Échec de récupération à la page ${page} après plusieurs tentatives (${upserted} club${upserted > 1 ? "s" : ""} déjà importé${upserted > 1 ? "s" : ""} avant l'échec).`,
      };
    }
    if (items.length === 0) break;

    // Independent per-row upserts run concurrently rather than as one
    // interactive transaction: against the pooler's network latency, a
    // 30-row transaction batch blows past Prisma's 5s interactive-transaction
    // timeout, and there's no need for page-level atomicity here (upsert is
    // idempotent, so a partial page just gets fully retried in future syncs).
    await Promise.all(
      items.map((c) =>
        prisma.club.upsert({
          where: { fffId: c.fffId },
          update: {
            name: c.name,
            shortName: c.shortName,
            city: c.location,
            postalCode: c.postalCode,
            districtName: c.districtName,
            districtShortName: c.districtShortName,
            latitude: c.latitude,
            longitude: c.longitude,
            ...(c.logoUrl ? { logoUrl: c.logoUrl } : {}),
          },
          create: {
            fffId: c.fffId,
            name: c.name,
            shortName: c.shortName,
            city: c.location,
            postalCode: c.postalCode,
            districtName: c.districtName,
            districtShortName: c.districtShortName,
            latitude: c.latitude,
            longitude: c.longitude,
            logoUrl: c.logoUrl,
          },
        })
      )
    );

    upserted += items.length;
    page += 1;
    await new Promise((resolve) => setTimeout(resolve, FFF_SYNC_PAGE_DELAY_MS));
  }

  revalidatePath("/admin/clubs");
  return { upserted, pages: page - 1 };
}
