/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `TeamMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "refreshToken" TEXT,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");
