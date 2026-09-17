-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('YELLOW', 'RED');

-- AlterEnum
ALTER TYPE "UpdateType" ADD VALUE 'CARD';

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "assistName" TEXT,
ADD COLUMN     "assistNumber" INTEGER,
ADD COLUMN     "scorerNumber" INTEGER;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "number" INTEGER,
    "type" "CardType" NOT NULL,
    "minute" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Card_matchId_idx" ON "Card"("matchId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
