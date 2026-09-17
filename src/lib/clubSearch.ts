import "server-only";
import { prisma } from "@/lib/prisma";

export interface ClubSearchResult {
  id: string;
  name: string;
  logoUrl: string | null;
  fffId: string | null;
  city: string | null;
}

const SIMILARITY_THRESHOLD = 0.25;

/**
 * Matches on name, shortName and city (all with typo-tolerant pg_trgm
 * similarity() beyond plain contains-matches, since a search can hit any of
 * the three — e.g. an alternate short name or the club's town).
 */
export async function searchClubs(
  query: string,
  { limit, offset = 0 }: { limit: number; offset?: number }
): Promise<ClubSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const like = `%${trimmed}%`;

  return prisma.$queryRaw<ClubSearchResult[]>`
    SELECT "id", "name", "logoUrl", "fffId", "city"
    FROM "Club"
    WHERE "name" ILIKE ${like}
       OR "shortName" ILIKE ${like}
       OR "city" ILIKE ${like}
       OR similarity("name", ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity(COALESCE("shortName", ''), ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity(COALESCE("city", ''), ${trimmed}) > ${SIMILARITY_THRESHOLD}
    ORDER BY
      ("name" ILIKE ${like}) DESC,
      GREATEST(
        similarity("name", ${trimmed}),
        similarity(COALESCE("shortName", ''), ${trimmed}),
        similarity(COALESCE("city", ''), ${trimmed})
      ) DESC,
      "name" ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

export async function countClubSearch(query: string): Promise<number> {
  const trimmed = query.trim();
  if (!trimmed) return 0;

  const like = `%${trimmed}%`;
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM "Club"
    WHERE "name" ILIKE ${like}
       OR "shortName" ILIKE ${like}
       OR "city" ILIKE ${like}
       OR similarity("name", ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity(COALESCE("shortName", ''), ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity(COALESCE("city", ''), ${trimmed}) > ${SIMILARITY_THRESHOLD}
  `;
  return rows[0]?.count ?? 0;
}
