-- CreateTable
CREATE TABLE "habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dayHabit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date_id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "habit_id_key" ON "habit"("id");

-- CreateIndex
CREATE UNIQUE INDEX "dayHabit_date_id_habit_id_key" ON "dayHabit"("date_id", "habit_id");
