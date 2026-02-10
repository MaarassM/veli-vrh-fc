-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hnsId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Croatian',
    "dateOfBirth" TEXT,
    "placeOfBirth" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "preferredFoot" TEXT,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "appearances" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "imageLocal" TEXT,
    "profileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "opponent" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "competition" TEXT NOT NULL,
    "round" INTEGER,
    "venue" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "standings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "position" INTEGER NOT NULL,
    "team" TEXT NOT NULL,
    "played" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "goalDifference" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "competition" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "players_hnsId_key" ON "players"("hnsId");

-- CreateIndex
CREATE UNIQUE INDEX "standings_team_key" ON "standings"("team");
