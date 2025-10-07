/*
  Warnings:

  - You are about to drop the `_CardTeamMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_CardTeamMembers" DROP CONSTRAINT "_CardTeamMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CardTeamMembers" DROP CONSTRAINT "_CardTeamMembers_B_fkey";

-- DropTable
DROP TABLE "public"."_CardTeamMembers";

-- CreateTable
CREATE TABLE "public"."CardTeam" (
    "cardId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardTeam_pkey" PRIMARY KEY ("cardId","teamId")
);

-- AddForeignKey
ALTER TABLE "public"."CardTeam" ADD CONSTRAINT "CardTeam_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardTeam" ADD CONSTRAINT "CardTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
