-- Speed up ILIKE/similarity lookups on Club.shortName and Club.city, now
-- included in club search alongside Club.name.
CREATE INDEX IF NOT EXISTS "Club_shortName_trgm_idx" ON "Club" USING GIN ("shortName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Club_city_trgm_idx" ON "Club" USING GIN ("city" gin_trgm_ops);
