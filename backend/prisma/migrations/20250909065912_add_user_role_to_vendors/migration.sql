/*
  Warnings:

  - The `role` column on the `Vendors` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Vendors" DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" DEFAULT 'VENDOR';
