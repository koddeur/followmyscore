"use server";

import { searchClubs } from "@/lib/clubSearch";
import { searchMatches } from "@/lib/matchSearch";
import { searchUsers } from "@/lib/userSearch";

const DROPDOWN_LIMIT = 5;

export async function searchAll(query: string) {
  const [clubs, matches, users] = await Promise.all([
    searchClubs(query, { limit: DROPDOWN_LIMIT }),
    searchMatches(query, DROPDOWN_LIMIT),
    searchUsers(query, DROPDOWN_LIMIT),
  ]);

  return { clubs, matches, users };
}
