import "server-only";
import { prisma } from "@/lib/prisma";

const SIMILARITY_THRESHOLD = 0.25;

/**
 * Contains-matches on either club's name, the competition or the venue are
 * ranked first; pg_trgm similarity() beyond that surfaces close-but-not-exact
 * names so a typo in the query still finds a match.
 */
export async function searchMatches(query: string, limit: number) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const like = `%${trimmed}%`;

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT m."id"
    FROM "Match" m
    JOIN "Club" hc ON hc."id" = m."homeClubId"
    JOIN "Club" ac ON ac."id" = m."awayClubId"
    WHERE hc."name" ILIKE ${like}
       OR ac."name" ILIKE ${like}
       OR m."competition" ILIKE ${like}
       OR m."venue" ILIKE ${like}
       OR similarity(hc."name", ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity(ac."name", ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity(COALESCE(m."competition", ''), ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity(COALESCE(m."venue", ''), ${trimmed}) > ${SIMILARITY_THRESHOLD}
    ORDER BY
      (hc."name" ILIKE ${like} OR ac."name" ILIKE ${like} OR m."competition" ILIKE ${like} OR m."venue" ILIKE ${like}) DESC,
      GREATEST(
        similarity(hc."name", ${trimmed}),
        similarity(ac."name", ${trimmed}),
        similarity(COALESCE(m."competition", ''), ${trimmed}),
        similarity(COALESCE(m."venue", ''), ${trimmed})
      ) DESC,
      m."createdAt" DESC
    LIMIT ${limit}
  `;

  if (rows.length === 0) return [];

  const matches = await prisma.match.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    include: { homeClub: true, awayClub: true },
  });

  const order = new Map(rows.map((r, i) => [r.id, i]));
  return matches.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
