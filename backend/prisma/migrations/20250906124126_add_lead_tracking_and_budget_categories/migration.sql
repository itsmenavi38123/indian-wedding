-- CreateEnum
CREATE TYPE "public"."CardCreationType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "creationType" "public"."CardCreationType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "originalLeadId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_originalLeadId_fkey" FOREIGN KEY ("originalLeadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
