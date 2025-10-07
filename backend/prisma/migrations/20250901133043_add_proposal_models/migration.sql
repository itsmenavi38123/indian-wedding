/*
  Warnings:

  - You are about to drop the column `details` on the `Proposal` table. All the data in the column will be lost.
  - The `status` column on the `Proposal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[reference]` on the table `Proposal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientName` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateISO` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `introHTML` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTerms` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsText` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Proposal" DROP COLUMN "details",
ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "clientAddress" TEXT,
ADD COLUMN     "clientEmail" TEXT,
ADD COLUMN     "clientName" TEXT NOT NULL,
ADD COLUMN     "clientPhone" TEXT,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "dateISO" TEXT NOT NULL,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "introHTML" TEXT NOT NULL,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "paymentTerms" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "taxesPercent" DOUBLE PRECISION NOT NULL DEFAULT 18,
ADD COLUMN     "template" TEXT NOT NULL,
ADD COLUMN     "termsText" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "viewedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProposalStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "public"."ProposalService" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProposalCustomLine" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalCustomLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProposalVersion" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_reference_key" ON "public"."Proposal"("reference");

-- AddForeignKey
ALTER TABLE "public"."ProposalService" ADD CONSTRAINT "ProposalService_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProposalCustomLine" ADD CONSTRAINT "ProposalCustomLine_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProposalVersion" ADD CONSTRAINT "ProposalVersion_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
