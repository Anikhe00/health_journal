import { readFile } from "node:fs/promises";
import path from "node:path";
import { jsPDF } from "jspdf";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatLongDate, todayInputValue, toInputValue } from "@/lib/dates";
import { calculateAge } from "@/lib/passport";
import { readStoredFile } from "@/lib/storage";
import { parseTags } from "@/lib/tags";
import { getTimeZone } from "@/lib/timezone";

// The journal as a PDF that downloads straight away. It is made here, on the server, because the
// built-in PDF fonts can't draw the letters in many Nigerian names (ẹ, ọ, ṣ, ị, ụ), so Noto Sans is
// embedded instead. The font files are in lib/fonts (next.config.ts makes sure they ship with the route).

const PAGE = { width: 210, height: 297, margin: 18 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const BOTTOM = PAGE.height - PAGE.margin - 6; // leaves room for the footer
const PT = 0.3528; // one point in millimetres
const COLOR = { text: [15, 23, 42], muted: [100, 116, 139], line: [203, 213, 225], accent: [15, 118, 110] } as const;

type Rgb = readonly [number, number, number];
type Block = { kind: "heading" | "text" | "bullet" | "quote" | "code" | "gap"; text: string; marker?: string };

const fontFiles = { normal: "NotoSans-Regular.ttf", bold: "NotoSans-Bold.ttf" } as const;

async function loadFonts() {
  const dir = path.join(process.cwd(), "lib", "fonts");
  const [normal, bold] = await Promise.all([readFile(path.join(dir, fontFiles.normal)), readFile(path.join(dir, fontFiles.bold))]);
  return { normal: normal.toString("base64"), bold: bold.toString("base64") };
}

// Emoji and other characters outside the font would print as boxes, so they are dropped.
// NFC joins letters with their marks (e + dot below -> ẹ) so they use the font's ready-made letters.
function clean(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u{10000}-\u{10FFFF}‍️]/gu, "")
    .replace(/\t/g, "    ");
}

// The body is markdown. A PDF has no styled text, so this keeps the structure that matters
// (headings, lists, quotes, code, paragraphs) and drops the marks (**, _, `, links become "text (address)").
function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let inCode = false;
  for (const raw of clean(source).replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      blocks.push({ kind: "code", text: line });
      continue;
    }
    if (!line.trim()) {
      if (blocks.length && blocks[blocks.length - 1].kind !== "gap") blocks.push({ kind: "gap", text: "" });
      continue;
    }
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.*)$/);
    const bullet = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (heading) blocks.push({ kind: "heading", text: inline(heading[1]) });
    else if (bullet) blocks.push({ kind: "bullet", text: inline(bullet[2]), marker: /^\d/.test(bullet[1]) ? bullet[1] : "•" });
    else if (quote) blocks.push({ kind: "quote", text: inline(quote[1]) });
    else blocks.push({ kind: "text", text: inline(line.trim()) });
  }
  while (blocks.length && blocks[blocks.length - 1].kind === "gap") blocks.pop();
  return blocks;
}

function inline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, (_, label, url) => (label === url ? label : `${label} (${url})`))
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[^\w*])([*_])(.+?)\2(?![\w*])/g, "$1$3")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Please log in.", { status: 401 });

  const timeZone = await getTimeZone();
  const [user, passport, entries, fonts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.passport.findUnique({ where: { userId } }),
    prisma.entry.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { attachments: { orderBy: { createdAt: "asc" } } },
    }),
    loadFonts(),
  ]);
  if (!user) return new Response("Not found", { status: 404 });

  const today = todayInputValue(timeZone);
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: `${clean(user.name)} - health journal`, creator: "PatientLog" });
  doc.addFileToVFS(fontFiles.normal, fonts.normal);
  doc.addFont(fontFiles.normal, "NotoSans", "normal", "Identity-H");
  doc.addFileToVFS(fontFiles.bold, fonts.bold);
  doc.addFont(fontFiles.bold, "NotoSans", "bold", "Identity-H");

  let y = PAGE.margin;

  const style = (size: number, weight: "normal" | "bold" = "normal", color: Rgb = COLOR.text) => {
    doc.setFont("NotoSans", weight);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };
  const lineHeight = (size: number) => size * PT * 1.45;
  const ensureSpace = (height: number) => {
    if (y + height > BOTTOM) {
      doc.addPage();
      y = PAGE.margin;
    }
  };
  const rule = (color: Rgb = COLOR.line) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.2);
    doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  };

  // Writes wrapped text at the current position, moving to a new page when it runs out of room.
  // `keepLines` is how many lines must fit together, so a title is never left alone at the bottom of a page.
  const write = (text: string, opts: { size: number; weight?: "normal" | "bold"; color?: Rgb; indent?: number; keepLines?: number }) => {
    style(opts.size, opts.weight, opts.color);
    const indent = opts.indent ?? 0;
    const lines: string[] = doc.splitTextToSize(text, CONTENT_WIDTH - indent);
    const step = lineHeight(opts.size);
    ensureSpace(step * Math.min(lines.length, opts.keepLines ?? 2));
    for (const line of lines) {
      ensureSpace(step);
      doc.text(line, PAGE.margin + indent, y + opts.size * PT);
      y += step;
    }
  };

  // --- Heading: who the journal belongs to ---
  const age = user.dateOfBirth ? calculateAge(toInputValue(user.dateOfBirth)) : null;
  const facts = [
    user.dateOfBirth ? `Born ${formatLongDate(user.dateOfBirth)}${age !== null ? ` (${age} years)` : ""}` : null,
    user.bloodGroup ? `Blood group ${user.bloodGroup}` : null,
    user.genotype ? `Genotype ${user.genotype}` : null,
    user.emergencyContactPhone ? `Emergency contact ${user.emergencyContactName ? `${user.emergencyContactName}, ` : ""}${user.emergencyContactPhone}` : null,
  ].filter((fact): fact is string => Boolean(fact));

  write("HEALTH JOURNAL", { size: 8, weight: "bold", color: COLOR.accent });
  y += 1;
  write(clean(user.name), { size: 20, weight: "bold" });
  y += 1;
  if (facts.length > 0) write(clean(facts.join("  ·  ")), { size: 9.5 });
  y += 1;
  write(`Downloaded on ${formatLongDate(new Date(`${today}T00:00:00Z`))}. This is the patient's own journal, not an official medical record.`, {
    size: 8,
    color: COLOR.muted,
  });
  y += 3;
  rule(COLOR.muted);
  y += 5;

  const summary = [
    ["Allergies", passport?.allergies],
    ["Ongoing conditions", passport?.chronicConditions],
    ["Regular medicines", passport?.currentMedications],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  for (const [label, value] of summary) {
    style(9.5);
    const lines: string[] = doc.splitTextToSize(clean(value), CONTENT_WIDTH - 42);
    ensureSpace(lineHeight(9.5) * lines.length);
    style(9.5, "bold");
    doc.text(label, PAGE.margin, y + 9.5 * PT);
    style(9.5);
    for (const line of lines) {
      doc.text(line, PAGE.margin + 42, y + 9.5 * PT);
      y += lineHeight(9.5);
    }
  }
  if (summary.length > 0) {
    y += 3;
    rule();
    y += 6;
  }

  if (entries.length === 0) write("There are no entries yet.", { size: 10.5, color: COLOR.muted });

  // --- Entries ---
  let skippedImages = 0;
  for (const [index, entry] of entries.entries()) {
    ensureSpace(38); // date + title + a few lines of the body stay together
    write(formatLongDate(entry.date), { size: 8.5, weight: "bold", color: COLOR.muted });
    write(clean(entry.title), { size: 13.5, weight: "bold", keepLines: 2 });
    const tags = parseTags(entry.tags);
    if (tags.length > 0) write(tags.join("  ·  "), { size: 8.5, weight: "bold", color: COLOR.accent });
    y += 1.5;

    for (const block of parseMarkdown(entry.body)) {
      if (block.kind === "gap") y += 2;
      else if (block.kind === "heading") {
        y += 1;
        write(block.text, { size: 11, weight: "bold" });
      } else if (block.kind === "bullet") {
        ensureSpace(lineHeight(10));
        style(10);
        doc.text(block.marker ?? "•", PAGE.margin + 1, y + 10 * PT);
        write(block.text, { size: 10, indent: 7, keepLines: 1 });
      } else if (block.kind === "quote") {
        const start = y;
        const page = doc.getNumberOfPages();
        write(block.text, { size: 10, color: COLOR.muted, indent: 5 });
        if (doc.getNumberOfPages() === page) {
          doc.setDrawColor(COLOR.line[0], COLOR.line[1], COLOR.line[2]);
          doc.setLineWidth(0.6);
          doc.line(PAGE.margin + 1, start, PAGE.margin + 1, y);
        }
      } else if (block.kind === "code") write(block.text || " ", { size: 9, color: COLOR.muted, indent: 3, keepLines: 1 });
      else write(block.text, { size: 10, keepLines: 2 });
    }

    // Photos, three to a row.
    if (entry.attachments.length > 0) {
      y += 3;
      const gap = 3;
      const cell = (CONTENT_WIDTH - gap * 2) / 3;
      let column = 0;
      let rowHeight = 0;
      for (const image of entry.attachments) {
        const format = image.mimeType === "image/jpeg" ? "JPEG" : image.mimeType === "image/png" ? "PNG" : null;
        let bytes: Uint8Array | null = null;
        if (format) {
          try {
            bytes = new Uint8Array(await readStoredFile(image.id));
          } catch {
            // A missing file is left out rather than stopping the whole download.
          }
        }
        if (!format || !bytes) {
          skippedImages += 1;
          continue;
        }
        try {
          const props = doc.getImageProperties(bytes);
          const scale = Math.min(cell / props.width, cell / props.height);
          const width = props.width * scale;
          const height = props.height * scale;
          if (column === 0) ensureSpace(cell);
          const x = PAGE.margin + column * (cell + gap) + (cell - width) / 2;
          doc.addImage(bytes, format, x, y, width, height, undefined, "FAST");
          rowHeight = Math.max(rowHeight, height);
          column += 1;
          if (column === 3) {
            column = 0;
            y += rowHeight + gap;
            rowHeight = 0;
          }
        } catch {
          skippedImages += 1;
        }
      }
      if (column !== 0) y += rowHeight + gap;
    }

    if (index < entries.length - 1) {
      y += 3;
      ensureSpace(6);
      rule();
      y += 6;
    }
  }

  if (skippedImages > 0) {
    y += 6;
    write(`${skippedImages} photo${skippedImages === 1 ? " was" : "s were"} left out because ${skippedImages === 1 ? "it" : "they"} couldn't be added to the PDF. The ZIP download has every original photo.`, {
      size: 8.5,
      color: COLOR.muted,
    });
  }

  // --- Footer on every page ---
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    style(7.5, "normal", COLOR.muted);
    doc.text("PatientLog · personal journal, not a substitute for official medical records or emergency care", PAGE.margin, PAGE.height - 10);
    doc.text(`Page ${page} of ${pages}`, PAGE.width - PAGE.margin, PAGE.height - 10, { align: "right" });
  }

  return new Response(doc.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="patientlog-journal-${today}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
