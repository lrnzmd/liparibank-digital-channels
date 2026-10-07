/*
  Warnings:

  - You are about to drop the column `holder_name` on the `accounts` table. All the data in the column will be lost.
  - The `status` column on the `customers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_from_account_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_to_account_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "holder_name",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "transactions";

-- DropEnum
DROP TYPE "TransactionStatus";

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" VARCHAR(140) NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed_at" TIMESTAMP(3),
    "from_account_id" TEXT NOT NULL,
    "to_account_id" TEXT NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_customer_id_status_idx" ON "accounts"("customer_id", "status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_account_id_fkey" FOREIGN KEY ("to_account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
