-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'THUMBNAIL');

-- CreateTable
CREATE TABLE "public"."VendorService" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "thumbnailId" TEXT,

    CONSTRAINT "VendorService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorServiceMedia" (
    "id" TEXT NOT NULL,
    "vendorServiceId" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorServiceMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorService_thumbnailId_key" ON "public"."VendorService"("thumbnailId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorServiceMedia_vendorServiceId_url_key" ON "public"."VendorServiceMedia"("vendorServiceId", "url");

-- AddForeignKey
ALTER TABLE "public"."VendorService" ADD CONSTRAINT "VendorService_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorService" ADD CONSTRAINT "VendorService_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "public"."VendorServiceMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorServiceMedia" ADD CONSTRAINT "VendorServiceMedia_vendorServiceId_fkey" FOREIGN KEY ("vendorServiceId") REFERENCES "public"."VendorService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
