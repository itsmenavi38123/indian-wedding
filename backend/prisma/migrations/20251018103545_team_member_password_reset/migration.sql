-- AlterEnum
ALTER TYPE "TokenOwnerType" ADD VALUE 'TEAM';

-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN     "teamMemberId" TEXT;
