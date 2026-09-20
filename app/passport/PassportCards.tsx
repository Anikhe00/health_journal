"use client";

import { useRef, useState } from "react";
import PassportCard, { CARD_HEIGHT, CARD_WIDTH } from "@/components/passport/PassportCard";
import { ChevronRight, DownloadIcon, EyeIcon, rowClass } from "@/components/ListRows";
import { createPassportPdf } from "@/lib/passport-pdf";
import type { PassportData } from "@/lib/passport";

type Props = {
  data: PassportData;
  qrDataUrl: string;
  scanUrl: string;
  children?: React.ReactNode; // more rows for the list under the card (drawn by the page)
};

// The card (tap it to flip it over) and the list of things you can do with it.
export default function PassportCards({ data, qrDataUrl, scanUrl, children }: Props) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(false);

  const verifyText = scanUrl.split("?")[0].replace(/^https?:\/\//, "");
  const flip = () => setFlipped((current) => !current);

  async function downloadPdf() {
    if (!frontRef.current || !backRef.current) return;
    setBusy(true);
    setError("");
    try {
      const pdf = await createPassportPdf(frontRef.current, backRef.current);
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.fullName.trim().replace(/\s+/g, "-").toLowerCase() || "health"}-passport-card.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000); // some browsers need the link to live a moment longer
    } catch {
      setError("We couldn't make the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* One card that flips over when tapped. On phones it is shown smaller so it fits the screen. */}
      <div className="flex justify-center">
        <div className="[zoom:0.75] sm:[zoom:1]">
          <div
            role="button"
            tabIndex={0}
            aria-label={`Passport card, showing the ${flipped ? "back" : "front"}. Press to flip it.`}
            onClick={flip}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                flip();
              }
            }}
            className="cursor-pointer rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-teal-600/50 [perspective:1200px]"
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            <div
              className={`relative size-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="absolute inset-0 [backface-visibility:hidden]" aria-hidden={flipped}>
                <PassportCard variant="front" data={data} qrDataUrl={qrDataUrl} verifyText={verifyText} />
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!flipped}>
                <PassportCard variant="back" data={data} qrDataUrl={qrDataUrl} verifyText={verifyText} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-slate-500">Tap the card to see the {flipped ? "front" : "back"}</p>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="card divide-y divide-slate-100 overflow-hidden p-0!">
        <button type="button" onClick={downloadPdf} disabled={busy} className={rowClass}>
          <DownloadIcon />
          <span className="flex-1">{busy ? "Making PDF…" : "Download or print card"}</span>
          <ChevronRight />
        </button>
        <a href={scanUrl} target="_blank" rel="noopener" className={rowClass}>
          <EyeIcon />
          <span className="flex-1">Preview emergency view</span>
          <ChevronRight />
        </a>
        {children}
      </div>

      {/* Full-size copies, off-screen, that the PDF is made from. */}
      <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden="true">
        <div ref={frontRef}>
          <PassportCard variant="front" data={data} qrDataUrl={qrDataUrl} verifyText={verifyText} />
        </div>
        <div ref={backRef}>
          <PassportCard variant="back" data={data} qrDataUrl={qrDataUrl} verifyText={verifyText} />
        </div>
      </div>
    </div>
  );
}
