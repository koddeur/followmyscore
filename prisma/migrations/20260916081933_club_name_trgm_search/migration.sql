-- Enable trigram similarity, used for typo-tolerant club name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Speed up ILIKE/similarity lookups on Club.name
CREATE INDEX IF NOT EXISTS "Club_name_trgm_idx" ON "Club" USING GIN ("name" gin_trgm_ops);
