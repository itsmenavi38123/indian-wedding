-- CreateEnum
CREATE TYPE "public"."RSVPStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'WAITLIST');

-- AlterTable
ALTER TABLE "public"."VendorService" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "public"."Destination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "baseCostMin" INTEGER NOT NULL,
    "baseCostMax" INTEGER NOT NULL,
    "heroImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DestinationPhoto" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "vendorServiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationId" TEXT,

    CONSTRAINT "DestinationPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RSVPWebsite" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locationId" TEXT,

    CONSTRAINT "RSVPWebsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RSVPEvent" (
    "id" TEXT NOT NULL,
    "rsvpWebsiteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,

    CONSTRAINT "RSVPEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RSVPGuest" (
    "id" TEXT NOT NULL,
    "rsvpWebsiteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "public"."RSVPStatus" NOT NULL DEFAULT 'INVITED',
    "inviteCode" TEXT,
    "partySize" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RSVPGuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_name_key" ON "public"."Destination"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_state_country_key" ON "public"."Location"("name", "state", "country");

-- CreateIndex
CREATE UNIQUE INDEX "RSVPWebsite_slug_key" ON "public"."RSVPWebsite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RSVPGuest_inviteCode_key" ON "public"."RSVPGuest"("inviteCode");

-- AddForeignKey
ALTER TABLE "public"."VendorService" ADD CONSTRAINT "VendorService_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DestinationPhoto" ADD CONSTRAINT "DestinationPhoto_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DestinationPhoto" ADD CONSTRAINT "DestinationPhoto_vendorServiceId_fkey" FOREIGN KEY ("vendorServiceId") REFERENCES "public"."VendorService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DestinationPhoto" ADD CONSTRAINT "DestinationPhoto_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RSVPWebsite" ADD CONSTRAINT "RSVPWebsite_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RSVPWebsite" ADD CONSTRAINT "RSVPWebsite_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RSVPEvent" ADD CONSTRAINT "RSVPEvent_rsvpWebsiteId_fkey" FOREIGN KEY ("rsvpWebsiteId") REFERENCES "public"."RSVPWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RSVPGuest" ADD CONSTRAINT "RSVPGuest_rsvpWebsiteId_fkey" FOREIGN KEY ("rsvpWebsiteId") REFERENCES "public"."RSVPWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
