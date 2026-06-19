-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "place" TEXT,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "photoUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CustomChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "topicId" TEXT,
    "promptEn" TEXT NOT NULL,
    "promptMs" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "role" TEXT NOT NULL DEFAULT 'parent',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Account" ("createdAt", "email", "id", "name", "passwordHash", "plan") SELECT "createdAt", "email", "id", "name", "passwordHash", "plan" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Review_published_createdAt_idx" ON "Review"("published", "createdAt");

-- CreateIndex
CREATE INDEX "CustomChallenge_subject_year_idx" ON "CustomChallenge"("subject", "year");
