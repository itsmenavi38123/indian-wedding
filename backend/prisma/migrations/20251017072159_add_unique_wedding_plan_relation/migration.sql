/*
  Warnings:

  - A unique constraint covering the columns `[weddingPlanId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "weddingPlanId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_weddingPlanId_key" ON "Lead"("weddingPlanId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_weddingPlanId_fkey" FOREIGN KEY ("weddingPlanId") REFERENCES "WeddingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
