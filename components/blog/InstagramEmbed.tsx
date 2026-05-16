type InstagramEmbedProps = {
  url: string;
  caption?: string;
  maxWidth?: number;
};

function toEmbedSrc(url: string) {
  const trimmed = url.trim().replace(/\/+$/, "");
  return `${trimmed}/embed/`;
}

export default function InstagramEmbed({
  url,
  caption,
  maxWidth = 540,
}: InstagramEmbedProps) {
  const src = toEmbedSrc(url);
  const ariaLabel = caption ?? "Instagram embed";

  return (
    <div className="my-6 flex flex-col items-center">
      <div
        className="relative w-full"
        style={{ maxWidth: `${maxWidth}px`, aspectRatio: "540 / 720" }}
      >
        <iframe
          src={src}
          title={ariaLabel}
          aria-label={ariaLabel}
          loading="lazy"
          allow="encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          scrolling="no"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
      {caption ? (
        <p
          className="font-body text-black/70 text-sm text-center mt-3"
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
