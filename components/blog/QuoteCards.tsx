/**
 * Companion blog post block: four anonymized parent voices from the
 * homeschool gaming thread, grouped by camp.
 *
 * Quotes render as real, crawlable text — never screenshots of the source
 * thread. Descriptors are generic; the private group is never named or linked.
 *
 * Built from <div>/<span> + a reset <blockquote> so the .blog-content prose
 * styles don't cascade into it.
 * Visual reference: EKUZO/Marketing/content-drafts/2026-05-21-companion-quote-cards.html
 */
type Variant = "red" | "amber" | "green" | "blue";

const PALETTE: Record<Variant, { bg: string; tx: string }> = {
  red: { bg: "#FCEBEB", tx: "#791F1F" },
  amber: { bg: "#FAEEDA", tx: "#633806" },
  green: { bg: "#EAF3DE", tx: "#27500A" },
  blue: { bg: "#E6F1FB", tx: "#0C447C" },
};

type QuoteCard = {
  variant: Variant;
  name: string;
  label?: string;
  badge?: string;
  quote: string;
  big?: boolean;
  featured?: boolean;
};

const CARDS: QuoteCard[] = [
  {
    variant: "red",
    name: "A homeschool mom",
    label: "Cut it off",
    quote: "The screens have become the babysitter.",
  },
  {
    variant: "amber",
    name: "A dad who games himself",
    label: "Set limits",
    quote:
      "Gaming is not inherently evil. We’re supposed to protect our kids, not withdraw them from everything.",
  },
  {
    variant: "green",
    name: "A mom who teaches with games",
    label: "Aim it",
    quote: "Use what they already love as a learning tool.",
  },
  {
    variant: "blue",
    name: "The dad who started the thread",
    badge: "Original poster",
    featured: true,
    big: true,
    quote:
      "Taking that away without a solid alternative can lead to serious emotional distress, including depression.",
  },
];

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

export default function QuoteCards() {
  return (
    <div className="my-8" aria-label="Homeschool gaming, in parents' own words">
      <div
        className="font-body font-semibold text-black"
        style={{ fontSize: "20px" }}
      >
        Homeschool gaming, in parents&apos; own words
      </div>
      <div
        className="font-body"
        style={{ fontSize: "14px", color: "#6b6a66", margin: "4px 0 16px" }}
      >
        Four voices from one thread, grouped by camp.
      </div>

      <div
        className="flex flex-col gap-[14px]"
        style={{ background: "#f1efe8", borderRadius: "16px", padding: "20px" }}
      >
        {CARDS.map((card) => {
          const pal = PALETTE[card.variant];
          return (
            <div
              key={card.name}
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
                  {card.name}
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
                ) : (
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
                )}
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
                className="flex items-center"
                style={{
                  marginTop: "14px",
                  color: "#9a988f",
                  fontSize: "13px",
                }}
              >
                <span className="font-body">Homeschool parenting group</span>
                <span
                  className="flex items-center"
                  style={{ marginLeft: "auto", gap: "14px" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
                  </svg>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12a8 8 0 0 1-11 7l-5 1 1-4a8 8 0 1 1 15-4z" />
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="font-body"
        style={{
          fontSize: "12px",
          color: "#9a988f",
          margin: "14px 4px 0",
          lineHeight: 1.5,
        }}
      >
        Illustrative, anonymized recreations of real comments from a 2024
        homeschool parent discussion. Names and avatars are generic; nothing
        here is a screenshot of the original thread.
      </div>
    </div>
  );
}
