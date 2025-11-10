-- Comprehensive migration to ensure all schema fields exist in database

-- ===== PROPOSAL TABLE =====
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "budgetMin" BIGINT;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "budgetMax" BIGINT;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "guestCountMin" INTEGER;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "guestCountMax" INTEGER;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "preferredLocations" JSONB;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "events" JSONB;

-- ===== PROPOSAL SERVICE TABLE =====
ALTER TABLE "ProposalService" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "ProposalService" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "ProposalService" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
ALTER TABLE "ProposalService" ADD COLUMN IF NOT EXISTS "vendorServiceId" TEXT;
ALTER TABLE "ProposalService" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Add foreign keys if they don't exist
DO $$ BEGIN
    ALTER TABLE "ProposalService" ADD CONSTRAINT "ProposalService_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "ProposalService" ADD CONSTRAINT "ProposalService_vendorServiceId_fkey"
    FOREIGN KEY ("vendorServiceId") REFERENCES "VendorService"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===== LEAD TABLE =====
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "weddingPlanId" TEXT;
DO $$ BEGIN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_weddingPlanId_key" UNIQUE ("weddingPlanId");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_weddingPlanId_fkey"
    FOREIGN KEY ("weddingPlanId") REFERENCES "WeddingPlan"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===== TEAM TABLE =====
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "adminId" TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE "Team" ALTER COLUMN "vendorId" DROP NOT NULL;

DO $$ BEGIN
    ALTER TABLE "Team" ADD CONSTRAINT "Team_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===== TEAM MEMBER TABLE =====
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "adminId" TEXT;
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "roleLogin" TEXT;
ALTER TABLE "TeamMember" ALTER COLUMN "vendorId" DROP NOT NULL;
ALTER TABLE "TeamMember" ALTER COLUMN "email" SET NOT NULL;

DO $$ BEGIN
    ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_email_key" UNIQUE ("email");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===== PASSWORD RESET TOKEN TABLE =====
ALTER TABLE "PasswordResetToken" ADD COLUMN IF NOT EXISTS "teamMemberId" TEXT;

DO $$ BEGIN
    ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_teamMemberId_fkey"
    FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===== CONTRACT TABLE =====
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "signedUrl" TEXT;
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "signerEmail" TEXT;
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "signerName" TEXT;
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING';

-- ===== VENDOR SERVICE TABLE =====
ALTER TABLE "VendorService" ADD COLUMN IF NOT EXISTS "capacity" TEXT;
ALTER TABLE "VendorService" ADD COLUMN IF NOT EXISTS "destinationId" TEXT;

DO $$ BEGIN
    ALTER TABLE "VendorService" ADD CONSTRAINT "VendorService_destinationId_fkey"
    FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
