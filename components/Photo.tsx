// A plain <img>. Photos come from our private /api/attachments route or from the browser,
// so Next's image optimizer (next/image) has nothing to add here.
export default function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
