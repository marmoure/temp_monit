/*
  Warnings:

  - You are about to drop the column `sensors` on the `Device` table. All the data in the column will be lost.
  - Added the required column `sensor` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "sensor" TEXT NOT NULL
);
INSERT INTO "new_Device" ("device_id", "id", "name") SELECT "device_id", "id", "name" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_device_id_key" ON "Device"("device_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
