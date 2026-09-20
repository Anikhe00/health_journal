-- CreateTable
CREATE TABLE "shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "label" TEXT,
    "expires_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "last_viewed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "share_entries" (
    "share_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,

    PRIMARY KEY ("share_id", "entry_id"),
    CONSTRAINT "share_entries_share_id_fkey" FOREIGN KEY ("share_id") REFERENCES "shares" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "share_entries_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "date_of_birth" DATETIME,
    "blood_group" TEXT,
    "genotype" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_version" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_users" ("blood_group", "created_at", "date_of_birth", "email", "emergency_contact_name", "emergency_contact_phone", "genotype", "id", "name", "password_hash") SELECT "blood_group", "created_at", "date_of_birth", "email", "emergency_contact_name", "emergency_contact_phone", "genotype", "id", "name", "password_hash" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "shares_token_hash_key" ON "shares"("token_hash");

-- CreateIndex
CREATE INDEX "shares_user_id_idx" ON "shares"("user_id");
