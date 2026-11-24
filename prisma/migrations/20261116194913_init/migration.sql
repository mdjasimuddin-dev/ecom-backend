/*
  Warnings:

  - The `gender` column on the `Profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `addresses` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- DropIndex
DROP INDEX "Users_phone_key";

-- AlterTable
ALTER TABLE "Profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "phone" TEXT,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "addresses",
DROP COLUMN "phone",
DROP COLUMN "profilePicture",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profiles_phone_key" ON "Profiles"("phone");
