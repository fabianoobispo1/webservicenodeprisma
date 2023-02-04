-- CreateTable
CREATE TABLE "exercise_week_days" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exercise_id" TEXT NOT NULL,
    "week_day" INTEGER NOT NULL,
    CONSTRAINT "exercise_week_days_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_week_days_exercise_id_week_day_key" ON "exercise_week_days"("exercise_id", "week_day");
