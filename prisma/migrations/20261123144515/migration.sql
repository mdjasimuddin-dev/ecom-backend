/*
  Warnings:

  - You are about to drop the column `streetAddress` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `address` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "streetAddress",
ADD COLUMN     "address" TEXT NOT NULL;
