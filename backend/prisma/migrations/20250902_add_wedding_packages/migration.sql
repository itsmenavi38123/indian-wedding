-- CreateEnum
CREATE TYPE "PackageCategory" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'LUXURY');

-- CreateTable
CREATE TABLE "WeddingPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "category" "PackageCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingPackageService" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingPackageService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeddingPackageService" ADD CONSTRAINT "WeddingPackageService_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "WeddingPackage"("id") ON DELETE CASCADE;