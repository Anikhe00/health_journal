// Runs in the browser. Turns the two card faces (front and back) into one PDF, ready to print.
// jsPDF and html2canvas are big, so they are only loaded when someone clicks "Download PDF".
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;
const MARGIN_MM = 10;
const GAP_MM = 8;

export async function createPassportPdf(front: HTMLElement, back: HTMLElement): Promise<Blob> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas-pro")]);

  const [frontCanvas, backCanvas] = await Promise.all([
    html2canvas(front, { scale: 4, backgroundColor: "#ffffff" }),
    html2canvas(back, { scale: 4, backgroundColor: "#ffffff" }),
  ]);

  const pageWidth = MARGIN_MM * 2 + CARD_WIDTH_MM * 2 + GAP_MM;
  const pageHeight = MARGIN_MM * 2 + CARD_HEIGHT_MM;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [pageWidth, pageHeight] });

  // High-quality JPEG instead of PNG: the PDF is a few hundred KB, not 10 MB, and the QR code stays sharp.
  const jpeg = (canvas: HTMLCanvasElement) => canvas.toDataURL("image/jpeg", 0.92);
  pdf.addImage(jpeg(frontCanvas), "JPEG", MARGIN_MM, MARGIN_MM, CARD_WIDTH_MM, CARD_HEIGHT_MM);
  pdf.addImage(jpeg(backCanvas), "JPEG", MARGIN_MM + CARD_WIDTH_MM + GAP_MM, MARGIN_MM, CARD_WIDTH_MM, CARD_HEIGHT_MM);

  return pdf.output("blob");
}
