/*
  Warnings:

  - You are about to drop the column `creationType` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `kanbanBoardId` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Card` table. All the data in the column will be lost.
  - Added the required column `vendorId` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CardStatus" AS ENUM ('INQUIRY', 'PROPOSAL', 'BOOKED', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Card" DROP COLUMN "creationType",
DROP COLUMN "description",
DROP COLUMN "kanbanBoardId",
DROP COLUMN "title",
ADD COLUMN     "vendorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT;

-- DropEnum
DROP TYPE "public"."CardCreationType";

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
