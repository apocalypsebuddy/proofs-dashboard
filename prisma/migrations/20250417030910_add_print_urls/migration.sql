/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Proof` table. All the data in the column will be lost.
  - Added the required column `printBackUrl` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `printFrontUrl` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" DROP COLUMN "imageUrl",
ADD COLUMN     "printBackUrl" TEXT NOT NULL,
ADD COLUMN     "printFrontUrl" TEXT NOT NULL;
