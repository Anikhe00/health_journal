-- Genotype now lives on the profile (users), next to blood group, instead of on the passport.

-- AlterTable
ALTER TABLE "users" ADD COLUMN "genotype" TEXT;

-- Carry existing genotypes over from each passport to its owner's profile
UPDATE "users"
SET "genotype" = (SELECT "genotype" FROM "passports" WHERE "passports"."user_id" = "users"."id")
WHERE EXISTS (SELECT 1 FROM "passports" WHERE "passports"."user_id" = "users"."id" AND "passports"."genotype" IS NOT NULL);

-- RedefineTables (drops passports.genotype)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_passports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "allergies" TEXT,
    "chronic_conditions" TEXT,
    "current_medications" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "passports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_passports" ("allergies", "chronic_conditions", "created_at", "current_medications", "id", "sex", "updated_at", "user_id") SELECT "allergies", "chronic_conditions", "created_at", "current_medications", "id", "sex", "updated_at", "user_id" FROM "passports";
DROP TABLE "passports";
ALTER TABLE "new_passports" RENAME TO "passports";
CREATE UNIQUE INDEX "passports_user_id_key" ON "passports"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
