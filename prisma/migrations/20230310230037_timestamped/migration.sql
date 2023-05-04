-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Temperature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_id" INTEGER NOT NULL,
    CONSTRAINT "Temperature_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Temperature" ("device_id", "id", "value") SELECT "device_id", "id", "value" FROM "Temperature";
DROP TABLE "Temperature";
ALTER TABLE "new_Temperature" RENAME TO "Temperature";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
