-- CreateTable
CREATE TABLE "public"."homepage_sections" (
    "id" SERIAL NOT NULL,
    "section_key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "homepage_sections_section_key_key" ON "public"."homepage_sections"("section_key");
