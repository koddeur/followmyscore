import "server-only";
import { prisma } from "@/lib/prisma";

function slugifyPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * `{home}-vs-{away}-{YYYY-MM-DD}`, deduplicated with a numeric suffix on
 * collision (same two clubs, same day). Generated once at creation and never
 * changed afterward, even if the match is later edited — stable URLs.
 */
export async function generateMatchSlug(
  homeClubName: string,
  awayClubName: string,
  date: Date
): Promise<string> {
  const dateStr = date.toISOString().slice(0, 10);
  const base = `${slugifyPart(homeClubName)}-vs-${slugifyPart(awayClubName)}-${dateStr}`;

  let candidate = base;
  let suffix = 2;
  while (await prisma.match.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
