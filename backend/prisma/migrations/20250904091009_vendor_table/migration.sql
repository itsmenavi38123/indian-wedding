-- CreateTable
CREATE TABLE "public"."Vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "serviceTypes" TEXT NOT NULL,
    "minimumAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maximumAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL,

    CONSTRAINT "Vendors_pkey" PRIMARY KEY ("id")
);
