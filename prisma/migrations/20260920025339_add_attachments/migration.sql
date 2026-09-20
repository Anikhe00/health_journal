-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entry_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachments_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "attachments_entry_id_idx" ON "attachments"("entry_id");
