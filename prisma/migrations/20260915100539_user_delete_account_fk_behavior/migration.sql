-- Allow deleting a User without destroying shared match content: orphan
-- (SET NULL) the records they created, but cascade-delete their own comments.

-- Match.createdById
ALTER TABLE "Match" ALTER COLUMN "createdById" DROP NOT NULL;
ALTER TABLE "Match" DROP CONSTRAINT "Match_createdById_fkey";
ALTER TABLE "Match" ADD CONSTRAINT "Match_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- MatchUpdate.userId
ALTER TABLE "MatchUpdate" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "MatchUpdate" DROP CONSTRAINT "MatchUpdate_userId_fkey";
ALTER TABLE "MatchUpdate" ADD CONSTRAINT "MatchUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Goal.createdById
ALTER TABLE "Goal" ALTER COLUMN "createdById" DROP NOT NULL;
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_createdById_fkey";
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Card.createdById
ALTER TABLE "Card" ALTER COLUMN "createdById" DROP NOT NULL;
ALTER TABLE "Card" DROP CONSTRAINT "Card_createdById_fkey";
ALTER TABLE "Card" ADD CONSTRAINT "Card_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Lineup.createdById
ALTER TABLE "Lineup" ALTER COLUMN "createdById" DROP NOT NULL;
ALTER TABLE "Lineup" DROP CONSTRAINT "Lineup_createdById_fkey";
ALTER TABLE "Lineup" ADD CONSTRAINT "Lineup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Comment.userId: comments are personal, delete them with the account.
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
