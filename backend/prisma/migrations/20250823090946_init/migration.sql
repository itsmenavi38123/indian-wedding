-- CreateTable
CREATE TABLE "public"."Card" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kanbanBoardId" TEXT NOT NULL,
    "assignedUserId" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
