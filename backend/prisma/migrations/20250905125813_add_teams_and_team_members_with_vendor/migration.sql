/*
  Warnings:

  - Added the required column `vendorId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TeamMember" ADD COLUMN     "vendorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
