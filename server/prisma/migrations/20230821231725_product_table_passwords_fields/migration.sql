-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordChangeAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "passwordResetExpires" DATETIME;
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
