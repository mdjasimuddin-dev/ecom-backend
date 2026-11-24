/*
  Warnings:

  - You are about to alter the column `minOrderAmount` on the `coupons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "coupons" ALTER COLUMN "minOrderAmount" DROP DEFAULT,
ALTER COLUMN "minOrderAmount" SET DATA TYPE DECIMAL(10,2);
