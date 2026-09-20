"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { parseDateInput } from "@/lib/dates";
import { serializeTags } from "@/lib/tags";
import { MAX_IMAGES_PER_ENTRY, MAX_UPLOAD_BYTES, sniffImageType } from "@/lib/attachments";
import { deleteStoredFiles, saveFile } from "@/lib/storage";

export type EntryFormState = { error?: string } | undefined;

// Read and check the form fields. Returns either clean data or an error message.
function readEntryForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const date = parseDateInput(String(formData.get("date") ?? ""));
  const tags = serializeTags(formData.getAll("tags").map(String));

  if (!title) return { error: "Please give this entry a title." };
  if (title.length > 150) return { error: "The title is too long. Please keep it under 150 characters." };
  if (!date) return { error: "Please choose a valid date." };

  return { data: { title, body, date, tags } };
}

type NewImage = { id: string; fileName: string; mimeType: string; sizeBytes: number; data: Buffer };

// Read and check the uploaded images. `keptCount` is how many images the entry already has.
async function readImages(formData: FormData, keptCount: number) {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (keptCount + files.length > MAX_IMAGES_PER_ENTRY) {
    return { error: `You can add up to ${MAX_IMAGES_PER_ENTRY} images to one entry.` };
  }

  if (files.reduce((total, file) => total + file.size, 0) > MAX_UPLOAD_BYTES) {
    return { error: "Photos can be up to 4 MB in total each time you save. Try fewer or smaller photos." };
  }

  const images: NewImage[] = [];
  for (const file of files) {
    const data = Buffer.from(await file.arrayBuffer());
    const mimeType = sniffImageType(data);
    if (!mimeType) return { error: `"${file.name}" isn't a JPG, PNG or WebP image.` };

    images.push({ id: randomUUID(), fileName: file.name.slice(0, 200), mimeType, sizeBytes: data.length, data });
  }
  return { images };
}

// The database rows for new images (without the file contents).
function imageRows(images: NewImage[]) {
  return images.map(({ id, fileName, mimeType, sizeBytes }) => ({ id, fileName, mimeType, sizeBytes }));
}

export async function createEntry(_prev: EntryFormState, formData: FormData): Promise<EntryFormState> {
  const userId = await requireUserId();

  const parsed = readEntryForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const uploaded = await readImages(formData, 0);
  if ("error" in uploaded) return { error: uploaded.error };

  // Save the files first, then the database rows. If the rows fail, remove the files again.
  await Promise.all(uploaded.images.map((image) => saveFile(image.id, image.data)));
  let entryId: string;
  try {
    const entry = await prisma.entry.create({
      data: { ...parsed.data, userId, attachments: { create: imageRows(uploaded.images) } },
    });
    entryId = entry.id;
  } catch (error) {
    await deleteStoredFiles(uploaded.images.map((image) => image.id));
    throw error;
  }

  redirect(`/entries/${entryId}`);
}

// Bound to an entry id in the edit drawer: updateEntry.bind(null, id)
export async function updateEntry(id: string, _prev: EntryFormState, formData: FormData): Promise<EntryFormState> {
  const userId = await requireUserId();

  const parsed = readEntryForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // Looking up by id AND userId means you can only ever change your own entries.
  const entry = await prisma.entry.findFirst({ where: { id, userId }, include: { attachments: true } });
  if (!entry) return { error: "We couldn't find that entry." };

  // Only images that really belong to this entry can be removed.
  const requestedRemovals = formData.getAll("removeAttachment").map(String);
  const removeIds = entry.attachments.filter((a) => requestedRemovals.includes(a.id)).map((a) => a.id);

  const uploaded = await readImages(formData, entry.attachments.length - removeIds.length);
  if ("error" in uploaded) return { error: uploaded.error };

  await Promise.all(uploaded.images.map((image) => saveFile(image.id, image.data)));
  try {
    await prisma.entry.update({
      where: { id },
      data: {
        ...parsed.data,
        attachments: { deleteMany: { id: { in: removeIds } }, create: imageRows(uploaded.images) },
      },
    });
  } catch (error) {
    await deleteStoredFiles(uploaded.images.map((image) => image.id));
    throw error;
  }
  await deleteStoredFiles(removeIds);

  redirect(`/entries/${id}`);
}

export async function deleteEntry(id: string) {
  const userId = await requireUserId();

  const attachments = await prisma.attachment.findMany({
    where: { entryId: id, entry: { userId } },
    select: { id: true },
  });
  const result = await prisma.entry.deleteMany({ where: { id, userId } }); // rows in attachments go with it
  if (result.count > 0) await deleteStoredFiles(attachments.map((a) => a.id));

  redirect("/dashboard");
}
