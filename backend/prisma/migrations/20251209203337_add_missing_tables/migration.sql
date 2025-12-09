/*
  Warnings:

  - You are about to drop the `StoreSettings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storeId,remoteJid]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `SupplyItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Chat_remoteJid_key";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SupplyItem" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "storeId" TEXT;

-- DropTable
DROP TABLE "StoreSettings";

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "logoUrl" TEXT,
    "contactPhone" TEXT,
    "isStoreOpen" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "whatsappStatus" TEXT,
    "latitude" DOUBLE PRECISION DEFAULT -23.550520,
    "longitude" DOUBLE PRECISION DEFAULT -46.633308,
    "integrations" TEXT,
    "deliveryRanges" TEXT,
    "driverFeeRanges" TEXT,
    "whatsappSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_storeId_remoteJid_key" ON "Chat"("storeId", "remoteJid");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyItem" ADD CONSTRAINT "SupplyItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
