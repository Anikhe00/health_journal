// Rules for supporting images. Shared by the form (browser) and the server actions.
export const MAX_IMAGES_PER_ENTRY = 5;
// All the photos added in one save together. Web hosts cap a request at about 4.5 MB, so stay just under it.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Work out what a file really is from its first bytes, not from the name or type the
// browser reports. Returns null if it isn't a JPEG, PNG or WebP image.
export function sniffImageType(bytes: Uint8Array): string | null {
  const startsWith = (signature: number[], offset = 0) => signature.every((b, i) => bytes[offset + i] === b);

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp"; // RIFF....WEBP
  return null;
}
