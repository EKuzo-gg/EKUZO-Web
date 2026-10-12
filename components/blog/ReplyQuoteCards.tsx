/**
 * Reply-quote cards for posts that read a public thread and report what it
 * said. Generalized from QuoteCards.tsx (the homeschool post's hard-coded
 * block) so any post can pass its own cards. Same palette and layout, so the
 * two blocks read as one series.
 *
 * Quotes render as real, crawlable text, never screenshots. Each card names
 * the public handle it quotes and the like count as shown at the time of
 * reading, because counts on X keep moving.
 *
 * Built from <div>/<span> + a reset <blockquote> so the .blog-content prose
 * styles don't cascade into it.
 */
export type ReplyCardVariant = "red" | "amber" | "green" | "blue";

const PALETTE: Record<ReplyCardVariant, { bg: string; tx: string }> = {
  red: { bg: "#FCEBEB", tx: "#791F1F" },
  amber: { bg: "#FAEEDA", tx: "#633806" },
  green: { bg: "#EAF3DE", tx: "#27500A" },
  blue: { bg: "#E6F1FB", tx: "#0C447C" },
};

export type ReplyCard = {
  variant: ReplyCardVariant;
  /** Public handle, with the @. */
  handle: string;
  /** Camp label on the right (hidden when `badge` is set). */
  label?: string;
  /** Badge next to the handle, for the one featured card. */
  badge?: string;
  quote: string;
  /** "863 likes" style string, already formatted. Omit when not shown. */
  likes?: string;
  big?: boolean;
  featured?: boolean;
};

type Props = {
  title: string;
  subtitle?: string;
  cards: ReplyCard[];
  /** Small print under the block. */
  footnote?: string;
  /** Where the quotes came from, shown in each card's footer. */
  sourceLabel?: string;
};

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-4 3-6 7-6s7 2 7 6" />
    </svg>
  );
}

export default function ReplyQuoteCards({
  title,
  subtitle,
  cards,
  footnote,
  sourceLabel = "Reply on X",
}: Props) {
  return (
    <div className="my-8" aria-label={title}>
      <div
        className="font-body font-semibold text-black"
        style={{ fontSize: "20px" }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          className="font-body"
          style={{ fontSize: "14px", color: "#6b6a66", margin: "4px 0 16px" }}
        >
          {subtitle}
        </div>
      ) : (
        <div style={{ height: "16px" }} />
      )}

      <div
        className="flex flex-col gap-[14px]"
        style={{ background: "#f1efe8", borderRadius: "16px", padding: "20px" }}
      >
        {cards.map((card) => {
          const pal = PALETTE[card.variant];
          return (
            <div
              key={`${card.handle}-${card.quote.slice(0, 24)}`}
              style={{
                background: "#ffffff",
                border: card.featured
                  ? "2px solid #378ADD"
                  : "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: "14px",
                padding: "18px 20px",
              }}
            >
              <div
                className="flex flex-wrap items-center gap-[10px]"
                style={{ marginBottom: "12px" }}
              >
                <span
                  className="flex shrink-0 items-center justify-center rounded-full"
                  style={{
                    width: "42px",
                    height: "42px",
                    background: pal.bg,
                    color: pal.tx,
                  }}
                >
                  <PersonIcon />
                </span>
                <span
                  className="font-body font-semibold text-black"
                  style={{ fontSize: "15px" }}
                >
                  {card.handle}
                </span>
                {card.badge ? (
                  <span
                    className="font-body font-semibold"
                    style={{
                      fontSize: "11px",
                      padding: "2px 9px",
                      borderRadius: "8px",
                      background: PALETTE.blue.bg,
                      color: PALETTE.blue.tx,
                    }}
                  >
                    {card.badge}
                  </span>
                ) : card.label ? (
                  <span
                    className="font-body font-semibold"
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      padding: "3px 11px",
                      borderRadius: "8px",
                      background: pal.bg,
                      color: pal.tx,
                    }}
                  >
                    {card.label}
                  </span>
                ) : null}
              </div>

              <blockquote
                style={{
                  margin: 0,
                  padding: 0,
                  border: "none",
                  fontStyle: "normal",
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: card.big ? "20px" : "18px",
                  lineHeight: 1.55,
                  color: "#1c1b19",
                }}
              >
                &ldquo;{card.quote}&rdquo;
              </blockquote>

              <div
                className="flex items-center font-body"
                style={{
                  marginTop: "14px",
                  color: "#9a988f",
                  fontSize: "13px",
                }}
              >
                <span>{sourceLabel}</span>
                {card.likes ? (
                  <span style={{ marginLeft: "auto" }}>{card.likes}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {footnote ? (
        <div
          className="font-body"
          style={{
            fontSize: "12px",
            color: "#9a988f",
            margin: "14px 4px 0",
            lineHeight: 1.5,
          }}
        >
          {footnote}
        </div>
      ) : null}
    </div>
  );
}
