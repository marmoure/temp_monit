/*
  Warnings:

  - Added the required column `sensors` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Humidity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_id" INTEGER NOT NULL,
    CONSTRAINT "Humidity_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "sensors" TEXT NOT NULL
);
INSERT INTO "new_Device" ("device_id", "id", "name") SELECT "device_id", "id", "name" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_device_id_key" ON "Device"("device_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
