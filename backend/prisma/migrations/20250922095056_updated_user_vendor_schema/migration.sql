/*
  Warnings:

  - You are about to drop the `Vendors` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TokenOwnerType" AS ENUM ('ADMIN', 'USER', 'VENDOR');

-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamMember" DROP CONSTRAINT "TeamMember_vendorId_fkey";

-- AlterTable
ALTER TABLE "public"."PasswordResetToken" ADD COLUMN     "type" "public"."TokenOwnerType" NOT NULL,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "vendorId" TEXT,
ALTER COLUMN "adminId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."Vendors";

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "serviceTypes" TEXT NOT NULL,
    "minimumAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maximumAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "role" "public"."UserRole" DEFAULT 'VENDOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshToken" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_email_key" ON "public"."Vendor"("email");

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
