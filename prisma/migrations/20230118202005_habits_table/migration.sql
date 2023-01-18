-- CreateTable
CREATE TABLE "habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "habit_id_key" ON "habit"("id");
