-- Speed up ILIKE/similarity lookups now used by match and user search
-- (pg_trgm extension already enabled by an earlier migration).
CREATE INDEX IF NOT EXISTS "Match_competition_trgm_idx" ON "Match" USING GIN ("competition" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Match_venue_trgm_idx" ON "Match" USING GIN ("venue" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "User_name_trgm_idx" ON "User" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "User_username_trgm_idx" ON "User" USING GIN ("username" gin_trgm_ops);
