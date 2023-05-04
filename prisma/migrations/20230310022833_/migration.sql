/*
  Warnings:

  - You are about to alter the column `device_id` on the `Device` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "device_id" INTEGER NOT NULL
);
INSERT INTO "new_Device" ("device_id", "id", "name") SELECT "device_id", "id", "name" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_device_id_key" ON "Device"("device_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
