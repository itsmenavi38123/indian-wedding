/*
  Warnings:

  - You are about to drop the column `assignedUserId` on the `Card` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_assignedUserId_fkey";

-- AlterTable
ALTER TABLE "public"."Card" DROP COLUMN "assignedUserId";
