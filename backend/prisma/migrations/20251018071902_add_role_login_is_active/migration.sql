-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'TEAM';

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "roleLogin" "UserRole";
