// A short plain-text preview of a markdown body for the timeline cards.
export function plainPreview(markdown: string, maxLength = 140): string {
  const text = markdown
    .replace(/[#*_`>~]/g, "") // markdown symbols
    .replace(/^\s*[-+]\s+/gm, "") // list bullets
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
