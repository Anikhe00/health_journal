-- CreateTable
CREATE TABLE "passports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "genotype" TEXT,
    "allergies" TEXT,
    "chronic_conditions" TEXT,
    "current_medications" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "passports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "passports_user_id_key" ON "passports"("user_id");
