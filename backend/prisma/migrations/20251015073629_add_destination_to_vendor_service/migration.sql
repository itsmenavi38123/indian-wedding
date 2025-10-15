-- AlterTable
ALTER TABLE "VendorService" ADD COLUMN     "destinationId" TEXT;

-- AddForeignKey
ALTER TABLE "VendorService" ADD CONSTRAINT "VendorService_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
