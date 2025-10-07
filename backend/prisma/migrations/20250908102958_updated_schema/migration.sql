-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "serviceTypes" TEXT,
ALTER COLUMN "leadSource" DROP NOT NULL,
ALTER COLUMN "leadSource" SET DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" DEFAULT 'USER';
