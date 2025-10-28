-- CreateEnum
CREATE TYPE "ProposalServiceStatus" AS ENUM ('PENDING', 'ASSIGNED', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "budgetMax" BIGINT,
ADD COLUMN     "budgetMin" BIGINT,
ADD COLUMN     "events" JSONB,
ADD COLUMN     "guestCountMax" INTEGER,
ADD COLUMN     "guestCountMin" INTEGER,
ADD COLUMN     "preferredLocations" JSONB;

-- AlterTable
ALTER TABLE "ProposalService" ADD COLUMN     "status" "ProposalServiceStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vendorId" TEXT,
ADD COLUMN     "vendorServiceId" TEXT;

-- AddForeignKey
ALTER TABLE "ProposalService" ADD CONSTRAINT "ProposalService_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalService" ADD CONSTRAINT "ProposalService_vendorServiceId_fkey" FOREIGN KEY ("vendorServiceId") REFERENCES "VendorService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
