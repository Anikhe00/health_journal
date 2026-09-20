import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readStoredFile } from "@/lib/storage";

// The only way to see an uploaded image. It is served only to the person who owns the entry.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Please log in.", { status: 401 });

  const { id } = await params;
  const attachment = await prisma.attachment.findFirst({
    where: { id, entry: { userId: session.user.id } },
  });
  // Same answer whether it doesn't exist or belongs to someone else.
  if (!attachment) return new Response("Not found", { status: 404 });

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
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
