-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_vendorId_fkey";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "type" "TeamType" NOT NULL DEFAULT 'EXTERNAL',
ALTER COLUMN "vendorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "roleLogin" SET DEFAULT 'TEAM';

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
