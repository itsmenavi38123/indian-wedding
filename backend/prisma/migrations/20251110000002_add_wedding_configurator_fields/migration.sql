-- Add Wedding Configurator fields to WeddingPlan table

-- Step 1: Welcome & Basic Info
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "coupleNames" TEXT;
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "subdomain" TEXT;
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "weddingStartDate" TIMESTAMP(3);
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "weddingEndDate" TIMESTAMP(3);
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "baseLocation" TEXT;

-- Step 2: Choose Your Vibe
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "vibe" TEXT;

-- Step 3: Location Preferences
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "region" TEXT;

-- Step 4: Budget Setup
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "budgetMin" BIGINT;
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "budgetMax" BIGINT;
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "budgetAllocation" JSONB;

-- Guest Mode Session
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "guestSessionToken" TEXT;
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "wizardCompleted" BOOLEAN DEFAULT false;

-- Site Customization
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "siteCoverPhoto" TEXT;
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "siteThemeColor" TEXT;
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "siteIntroMessage" TEXT;

-- Create unique index on subdomain if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingPlan_subdomain_key" ON "WeddingPlan"("subdomain");
