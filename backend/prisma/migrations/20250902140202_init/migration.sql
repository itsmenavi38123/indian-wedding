-- DropForeignKey
ALTER TABLE "public"."WeddingPackageService" DROP CONSTRAINT "WeddingPackageService_packageId_fkey";

-- AddForeignKey
ALTER TABLE "public"."WeddingPackageService" ADD CONSTRAINT "WeddingPackageService_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."WeddingPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
