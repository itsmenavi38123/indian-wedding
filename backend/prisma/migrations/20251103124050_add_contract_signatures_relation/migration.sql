-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "signedUrl" TEXT,
ADD COLUMN     "signerEmail" TEXT,
ADD COLUMN     "signerName" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ContractSignature" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT DEFAULT 'PENDING',
    "signedAt" TIMESTAMP(3),
    "signedFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractSignature_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContractSignature" ADD CONSTRAINT "ContractSignature_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
