import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from "fflate";
import { getCurrentUserId, getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toInputValue } from "@/lib/dates";
import { readStoredFile } from "@/lib/storage";
import { parseTags } from "@/lib/tags";

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "entry";

const README = `Your Health Journal export
============================

journal.json   Your profile, health passport details and every journal entry.
               You can open it with any text editor.
images/        The photos you added to your entries. Each entry in journal.json
               says which files belong to it.

Dates are written as YYYY-MM-DD.
`;

// Downloads everything in the journal as one ZIP file: the entries as data, and every photo.
// The ZIP is built piece by piece as it is sent, so a big journal doesn't have to fit in memory.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Please log in.", { status: 401 });

  const [user, passport, entries] = await Promise.all([
    getSessionUser(), // same query getCurrentUserId() already made, reused rather than repeated
    prisma.passport.findUnique({ where: { userId } }),
    prisma.entry.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { attachments: { orderBy: { createdAt: "asc" } } },
    }),
  ]);
  if (!user) return new Response("Not found", { status: 404 });

  // Work out each photo's place in the ZIP first, so journal.json can point to it.
  const files: { id: string; path: string }[] = [];
  const journal = {
    format: "health-journal-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth ? toInputValue(user.dateOfBirth) : null,
      bloodGroup: user.bloodGroup,
      genotype: user.genotype,
      emergencyContact: user.emergencyContactPhone ? { name: user.emergencyContactName, phone: user.emergencyContactPhone } : null,
    },
    passport: passport
      ? { sex: passport.sex, allergies: passport.allergies, ongoingConditions: passport.chronicConditions, regularMedicines: passport.currentMedications }
      : null,
    entries: entries.map((entry, entryIndex) => ({
      date: toInputValue(entry.date),
      title: entry.title,
      body: entry.body,
      tags: parseTags(entry.tags),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      images: entry.attachments.map((image, imageIndex) => {
        const path = `images/${toInputValue(entry.date)}_${slug(entry.title)}-${entryIndex + 1}_${imageIndex + 1}.${EXTENSIONS[image.mimeType] ?? "bin"}`;
        files.push({ id: image.id, path });
        return { fileName: image.fileName, file: path };
      }),
    })),
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const zip = new Zip((error, chunk, final) => {
          if (error) controller.error(error);
          else {
            controller.enqueue(chunk);
            if (final) controller.close();
          }
        });

        const text = (name: string, content: string) => {
          const file = new ZipDeflate(name, { level: 6 });
          zip.add(file);
          file.push(strToU8(content), true);
        };
        text("README.txt", README);
        text("journal.json", JSON.stringify(journal, null, 2));

        for (const { id, path } of files) {
          try {
            const file = new ZipPassThrough(path); // photos are already compressed
            zip.add(file);
            file.push(new Uint8Array(await readStoredFile(id)), true);
          } catch {
            // A missing file is skipped rather than stopping the whole download.
          }
        }
        zip.end();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="health-journal-${new Date().toISOString().slice(0, 10)}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
