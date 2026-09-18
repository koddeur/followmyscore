-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "districtName" TEXT,
ADD COLUMN     "districtShortName" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "postalCode" TEXT;

-- Speed up ILIKE/similarity lookups on Club.postalCode and Club.districtName,
-- now included in club search alongside name/shortName/city.
CREATE INDEX IF NOT EXISTS "Club_postalCode_trgm_idx" ON "Club" USING GIN ("postalCode" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Club_districtName_trgm_idx" ON "Club" USING GIN ("districtName" gin_trgm_ops);
