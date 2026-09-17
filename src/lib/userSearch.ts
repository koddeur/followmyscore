import "server-only";
import { prisma } from "@/lib/prisma";
import type { Role } from "../../generated/prisma/enums";

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: Role;
}

const SIMILARITY_THRESHOLD = 0.25;

/**
 * Contains-matches on name or username are ranked first; pg_trgm
 * similarity() beyond that surfaces close-but-not-exact names so a typo in
 * the query still finds someone.
 */
export async function searchUsers(query: string, limit: number): Promise<UserSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const like = `%${trimmed}%`;

  return prisma.$queryRaw<UserSearchResult[]>`
    SELECT "id", "name", "username", "avatarUrl", "role"
    FROM "User"
    WHERE "name" ILIKE ${like}
       OR "username" ILIKE ${like}
       OR similarity("name", ${trimmed}) > ${SIMILARITY_THRESHOLD}
       OR similarity("username", ${trimmed}) > ${SIMILARITY_THRESHOLD}
    ORDER BY
      ("name" ILIKE ${like} OR "username" ILIKE ${like}) DESC,
      GREATEST(similarity("name", ${trimmed}), similarity("username", ${trimmed})) DESC,
      "name" ASC
    LIMIT ${limit}
  `;
}
