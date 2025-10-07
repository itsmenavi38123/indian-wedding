/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vendors_email_key" ON "public"."Vendors"("email");
