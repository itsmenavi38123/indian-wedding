-- Add missing WeddingPlan fields that were in schema but not in previous migrations

-- Site Publishing Status
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "sitePublished" BOOLEAN DEFAULT false;

-- Wizard Progress Step
ALTER TABLE "WeddingPlan" ADD COLUMN IF NOT EXISTS "wizardStep" INTEGER DEFAULT 1;
