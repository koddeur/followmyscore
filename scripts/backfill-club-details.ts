import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BASE_URL = process.env.FFF_API_BASE_URL ?? "https://api-dofa.fff.fr";
const REQUEST_DELAY_MS = 200;
const MAX_RETRIES = 3;

interface FffRawClubDetail {
  cl_no: number;
  short_name: string | null;
  location: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDetail(fffId: string): Promise<FffRawClubDetail | null> {
  const url = `${BASE_URL}/api/clubs/${fffId}.json?filter=`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        return (await res.json()) as FffRawClubDetail;
      }
      if (res.status === 404) return null;
      console.warn(`club ${fffId}: HTTP ${res.status} (tentative ${attempt}/${MAX_RETRIES})`);
    } catch (error) {
      console.warn(
        `club ${fffId}: échec de requête (tentative ${attempt}/${MAX_RETRIES})`,
        error instanceof Error ? error.message : error
      );
    }
    await sleep(attempt * 1000);
  }
  return null;
}

async function main() {
  const clubs = await prisma.club.findMany({
    where: { fffId: { not: null }, shortName: null, city: null },
    select: { id: true, fffId: true },
  });
  console.log(`${clubs.length} clubs à traiter.`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < clubs.length; i++) {
    const club = clubs[i];
    if (!club.fffId) continue;

    const detail = await fetchDetail(club.fffId);
    if (!detail) {
      failed += 1;
    } else if (!detail.short_name && !detail.location) {
      skipped += 1;
    } else {
      await prisma.club.update({
        where: { id: club.id },
        data: {
          shortName: detail.short_name ?? undefined,
          city: detail.location ?? undefined,
        },
      });
      updated += 1;
    }

    if ((i + 1) % 250 === 0) {
      console.log(
        `${i + 1}/${clubs.length} traités — ${updated} mis à jour, ${skipped} sans donnée, ${failed} échecs`
      );
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log(
    `Terminé : ${clubs.length} clubs traités, ${updated} mis à jour, ${skipped} sans short_name/location, ${failed} échecs.`
  );
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
