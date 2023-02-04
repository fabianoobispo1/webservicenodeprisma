/*
  Warnings:

  - Made the column `exercise_id` on table `exercise_week_days` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercise_week_days" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exercise_id" TEXT NOT NULL,
    "week_day" INTEGER NOT NULL,
    CONSTRAINT "exercise_week_days_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_exercise_week_days" ("exercise_id", "id", "week_day") SELECT "exercise_id", "id", "week_day" FROM "exercise_week_days";
DROP TABLE "exercise_week_days";
ALTER TABLE "new_exercise_week_days" RENAME TO "exercise_week_days";
CREATE UNIQUE INDEX "exercise_week_days_exercise_id_week_day_key" ON "exercise_week_days"("exercise_id", "week_day");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
