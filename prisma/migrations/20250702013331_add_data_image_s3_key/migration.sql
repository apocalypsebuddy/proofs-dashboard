-- AlterTable
ALTER TABLE "Proof" ADD COLUMN     "dataImageS3Key" TEXT,
ALTER COLUMN "printBackUrl" DROP NOT NULL,
ALTER COLUMN "printFrontUrl" DROP NOT NULL;
