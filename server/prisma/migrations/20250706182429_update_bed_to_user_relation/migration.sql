/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `Bed` table. All the data in the column will be lost.
  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Bed` DROP FOREIGN KEY `Bed_assignedToId_fkey`;

-- DropIndex
DROP INDEX `Bed_assignedToId_fkey` ON `Bed`;

-- AlterTable
ALTER TABLE `Bed` DROP COLUMN `assignedToId`,
    ADD COLUMN `assignedToUserId` INTEGER NULL;

-- DropTable
DROP TABLE `Person`;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_assignedToUserId_fkey` FOREIGN KEY (`assignedToUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
