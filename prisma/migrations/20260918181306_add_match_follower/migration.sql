-- CreateTable
CREATE TABLE "MatchFollower" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchFollower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchFollower_matchId_idx" ON "MatchFollower"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchFollower_matchId_userId_key" ON "MatchFollower"("matchId", "userId");

-- AddForeignKey
ALTER TABLE "MatchFollower" ADD CONSTRAINT "MatchFollower_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchFollower" ADD CONSTRAINT "MatchFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
