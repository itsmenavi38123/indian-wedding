-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'Inquiry';
