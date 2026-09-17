import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BASE_URL = process.env.FFF_API_BASE_URL ?? "https://api-dofa.fff.fr";
const PAGE_DELAY_MS = 200;
const MAX_RETRIES = 4;
const FLUSH_THRESHOLD = 500;

interface FffRawClub {
  cl_no: number;
  name: string;
  logo: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page: number): Promise<FffRawClub[] | null> {
  const url = `${BASE_URL}/api/clubs.json?filter=test&page=${page}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        return (await res.json()) as FffRawClub[];
      }
      console.warn(`page ${page}: HTTP ${res.status} (tentative ${attempt}/${MAX_RETRIES})`);
    } catch (error) {
      console.warn(
        `page ${page}: échec de requête (tentative ${attempt}/${MAX_RETRIES})`,
        error instanceof Error ? error.message : error
      );
    }
    await sleep(attempt * 1000);
  }
  return null;
}

async function main() {
  let page = 1;
  let totalFetched = 0;
  let totalWritten = 0;
  let buffer: { fffId: string; name: string; logoUrl: string | null }[] = [];

  async function flush() {
    if (buffer.length === 0) return;
    const result = await prisma.club.createMany({ data: buffer, skipDuplicates: true });
    totalWritten += result.count;
    buffer = [];
  }

  for (;;) {
    const clubs = await fetchPage(page);
    if (clubs === null) {
      await flush();
      console.error(
        `Abandon à la page ${page} après ${MAX_RETRIES} tentatives. ${totalFetched} clubs récupérés, ${totalWritten} nouvelles lignes écrites.`
      );
      await prisma.$disconnect();
      process.exit(1);
    }
    if (clubs.length === 0) break;

    for (const c of clubs) {
      if (!c.cl_no || !c.name) continue;
      buffer.push({ fffId: String(c.cl_no), name: c.name, logoUrl: c.logo ?? null });
    }
    totalFetched += clubs.length;

    if (buffer.length >= FLUSH_THRESHOLD) await flush();
    if (page % 25 === 0) {
      console.log(`page ${page}: ${totalFetched} clubs récupérés jusqu'ici, ${totalWritten} écrits`);
    }

    page += 1;
    await sleep(PAGE_DELAY_MS);
  }

  await flush();
  console.log(
    `Terminé : ${totalFetched} clubs récupérés sur ${page - 1} pages, ${totalWritten} nouvelles lignes écrites (doublons par fffId ignorés).`
  );
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
