/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Users` table. All the data in the column will be lost.
  - The `role` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'CUSTOMER', 'STAFF', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "isVerified",
DROP COLUMN "phoneNumber",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needPasswordChange" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER';

-- DropEnum
DROP TYPE "UserRole";
