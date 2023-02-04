-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "repetition" INTEGER NOT NULL,
    "charge" INTEGER NOT NULL,
    "video_link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_ad" DATETIME NOT NULL
);
