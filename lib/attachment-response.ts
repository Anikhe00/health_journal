import { readStoredFile } from "@/lib/storage";

// The HTTP response for showing an uploaded image. Callers must already have checked the person may see it.
export async function attachmentResponse(
  attachment: { id: string; fileName: string; mimeType: string },
  cacheControl = "private, max-age=3600",
): Promise<Response> {
  let data: Buffer;
  try {
    data = await readStoredFile(attachment.id);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
