-- CreateTable
CREATE TABLE "PlayEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SocialProofEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "customerName" TEXT,
    "state" TEXT,
    "packageName" TEXT,
    "detail" TEXT,
    "childYear" INTEGER,
    "consentToDisplay" BOOLEAN NOT NULL DEFAULT false,
    "displayMode" TEXT NOT NULL DEFAULT 'firstNameInitial',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PlayEvent_createdAt_idx" ON "PlayEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SocialProofEvent_type_consentToDisplay_createdAt_idx" ON "SocialProofEvent"("type", "consentToDisplay", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
