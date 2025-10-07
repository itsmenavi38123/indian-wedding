/*
  Warnings:

  - You are about to drop the column `cardId` on the `TeamMember` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TeamMember" DROP CONSTRAINT "TeamMember_cardId_fkey";

-- AlterTable
ALTER TABLE "public"."TeamMember" DROP COLUMN "cardId";

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMemberOnTeam" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMemberOnTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CardTeamMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CardTeamMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMemberOnTeam_teamId_teamMemberId_key" ON "public"."TeamMemberOnTeam"("teamId", "teamMemberId");

-- CreateIndex
CREATE INDEX "_CardTeamMembers_B_index" ON "public"."_CardTeamMembers"("B");

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMemberOnTeam" ADD CONSTRAINT "TeamMemberOnTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMemberOnTeam" ADD CONSTRAINT "TeamMemberOnTeam_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "public"."TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardTeamMembers" ADD CONSTRAINT "_CardTeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardTeamMembers" ADD CONSTRAINT "_CardTeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
