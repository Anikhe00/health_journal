import { getCurrentUserId } from "@/lib/auth";
import { attachmentResponse } from "@/lib/attachment-response";
import { prisma } from "@/lib/db";

// The only way to see an uploaded image. It is served only to the person who owns the entry.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Please log in.", { status: 401 });

  const { id } = await params;
  const attachment = await prisma.attachment.findFirst({
    where: { id, entry: { userId } },
  });
  // Same answer whether it doesn't exist or belongs to someone else.
  if (!attachment) return new Response("Not found", { status: 404 });

  return attachmentResponse(attachment);
}
