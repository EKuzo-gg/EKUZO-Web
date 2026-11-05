/**
 * Blog post callout: a one-line pull-quote on black.
 *
 * Built from <div>/<span> only (not <p> or <blockquote>) so the .blog-content
 * prose styles don't cascade into it, same reason as GutCheckAside. Full width
 * inside the prose column, with the site's notched corners (top-left and
 * bottom-right, here 24px) and a short lime bar above the text.
 * The text is real, crawlable text.
 */
type PullQuoteProps = {
  children: React.ReactNode;
};

const NOTCH = "24px";

export default function PullQuote({ children }: PullQuoteProps) {
  return (
    <div
      role="note"
      className="my-10 w-full bg-black"
      style={{
        clipPath: `polygon(${NOTCH} 0, 100% 0, 100% calc(100% - ${NOTCH}), calc(100% - ${NOTCH}) 100%, 0 100%, 0 ${NOTCH})`,
        padding: "clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 5vw, 3.5rem)",
      }}
    >
      <span
        aria-hidden="true"
        className="block mb-5"
        style={{ width: "56px", height: "6px", background: "#E0FF4F" }}
      />
      <span
        className="block font-display uppercase text-white"
        style={{
          fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
          lineHeight: 1.1,
          fontWeight: 700,
        }}
      >
        {children}
      </span>
    </div>
  );
}
