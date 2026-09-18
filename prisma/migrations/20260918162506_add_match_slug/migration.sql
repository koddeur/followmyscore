-- AlterTable
ALTER TABLE "Match" ADD COLUMN "slug" TEXT;

-- Backfill: "{home}-vs-{away}-{YYYY-MM-DD}", falling back to createdAt when
-- kickoffAt is unset. Accented letters aren't folded (no unaccent extension
-- available), they just fall out via the non-alphanumeric strip below —
-- harmless for URLs, just not as pretty as the app-level generator used for
-- new matches going forward.
UPDATE "Match" m
SET "slug" = trim(both '-' from (
  regexp_replace(lower(hc.name), '[^a-z0-9]+', '-', 'g') || '-vs-' ||
  regexp_replace(lower(ac.name), '[^a-z0-9]+', '-', 'g') || '-' ||
  to_char(COALESCE(m."kickoffAt", m."createdAt"), 'YYYY-MM-DD')
))
FROM "Club" hc, "Club" ac
WHERE hc.id = m."homeClubId" AND ac.id = m."awayClubId";

-- Dedupe collisions (same two clubs, same day) before the unique constraint.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY slug ORDER BY "createdAt") AS rn
  FROM "Match"
)
UPDATE "Match" m
SET slug = m.slug || '-' || ranked.rn
FROM ranked
WHERE m.id = ranked.id AND ranked.rn > 1;

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");
