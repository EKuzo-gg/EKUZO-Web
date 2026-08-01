/**
 * Blog post callout: a numbered question checklist.
 *
 * Renders as a right-rail aside on desktop (float-right inside the blog body
 * column, text wraps around it) and folds to a full-width block on mobile.
 * The questions are real, crawlable text — never an image.
 *
 * PLACEMENT: put it directly AFTER an <h2> and before that section's first
 * <p>. There is no clear:both on .blog-content h2, so an aside placed before a
 * heading leaves the heading wrapping around it.
 *
 * Built from <div>/<span> only so the .blog-content prose styles (which
 * target p/ul/ol/li/a/blockquote/table) don't cascade into it.
 * Visual reference: EKUZO/Marketing/content-drafts/2026-05-21-pillar-5-questions-aside.html
 *
 * Parameterised 2026-08-01 so a second post could use it without a copy. The
 * defaults are the original pillar-post content, so
 * app/blog/when-gaming-helps-homeschool-kids renders exactly as before from a
 * bare <GutCheckAside />.
 */
const DEFAULT_QUESTIONS = [
  "Is there an adult nearby?",
  "Are they playing with the same people over time?",
  "Is there a goal?",
  "Did you choose the game on purpose?",
  "Did you talk about what happened after?",
];

const HAIRLINE = "1px solid rgba(0, 0, 0, 0.12)";

type GutCheckAsideProps = {
  title?: string;
  subtitle?: string;
  questions?: string[];
  /** Accessible name for the aside. Defaults to "title: subtitle". */
  label?: string;
};

export default function GutCheckAside({
  title = "A quick gut-check",
  subtitle = "Five questions about your kid's gaming",
  questions = DEFAULT_QUESTIONS,
  label,
}: GutCheckAsideProps) {
  return (
    <aside
      aria-label={label ?? `${title}: ${subtitle}`}
      className="my-6 w-full rounded-[14px] bg-white lg:float-right lg:ml-8 lg:mb-4 lg:w-[340px]"
      style={{ border: HAIRLINE, padding: "22px 24px" }}
    >
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#0C447C"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6h10M4 12h10M4 18h7" />
          <path d="M17 14l2 2 4-4" />
        </svg>
        <span
          className="font-body font-semibold"
          style={{ fontSize: "17px", color: "#1c1b19" }}
        >
          {title}
        </span>
      </div>
      <div
        className="font-body"
        style={{ fontSize: "13px", color: "#6b6a66", margin: "3px 0 4px" }}
      >
        {subtitle}
      </div>
      <div role="list">
        {questions.map((question, i) => (
          <div
            key={question}
            role="listitem"
            className="flex items-start gap-3"
            style={{ padding: "11px 0", borderTop: HAIRLINE }}
          >
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center justify-center rounded-full font-body font-semibold"
              style={{
                width: "26px",
                height: "26px",
                background: "#E6F1FB",
                color: "#0C447C",
                fontSize: "13px",
              }}
            >
              {i + 1}
            </span>
            <span
              className="font-body"
              style={{ fontSize: "15px", lineHeight: 1.5, color: "#1c1b19" }}
            >
              {question}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
