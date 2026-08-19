-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable: add userId as nullable first (existing rows have no owner)
ALTER TABLE "File" ADD COLUMN "userId" TEXT;

-- Remove any pre-existing files with no owner, since they can't be
-- assigned to a user retroactively (safe on a fresh/empty database)
DELETE FROM "File" WHERE "userId" IS NULL;

-- Now enforce NOT NULL going forward
ALTER TABLE "File" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
