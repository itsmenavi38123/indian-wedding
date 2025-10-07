-- CreateTable
CREATE TABLE "public"."ProposalTemplate" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "introHTML" TEXT NOT NULL,
    "termsText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProposalTemplateService" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalTemplateService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProposalTemplate_templateId_key" ON "public"."ProposalTemplate"("templateId");

-- AddForeignKey
ALTER TABLE "public"."ProposalTemplateService" ADD CONSTRAINT "ProposalTemplateService_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."ProposalTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
