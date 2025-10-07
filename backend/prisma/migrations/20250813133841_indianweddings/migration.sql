-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "whatsappNumberSameAsPhoneNumber" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "weddingDate" DROP NOT NULL;
