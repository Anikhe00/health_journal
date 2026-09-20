import { attachmentResponse } from "@/lib/attachment-response";
import { prisma } from "@/lib/db";
import { findActiveShare } from "@/lib/share";

// An image inside a shared journal. It needs a working share link, and the image must belong to an entry in that share.
export async function GET(_request: Request, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;

  const share = await findActiveShare(token);
  if (!share) return new Response("Not found", { status: 404 });

  const attachment = await prisma.attachment.findFirst({
    where: { id, entry: { shareEntries: { some: { shareId: share.id } } } },
  });
  if (!attachment) return new Response("Not found", { status: 404 });

  return attachmentResponse(attachment, "private, no-store");
}
