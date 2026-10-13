import Image from "next/image";
import Link from "next/link";
import { getAuthor, authorHref } from "@/lib/authors";
import { READ_TIME_CEILING_MINUTES } from "@/lib/readingTime";

/**
 * ── The byline on every blog post ───────────────────────────────────────────
 * Added 2026-07-28. Replaces a block that had been hand-copied into all 10
 * post pages, with three different date formats between them.
 *
 * LAYOUT (decided 2026-07-28, mobile-first on purpose — the blog is read
 * mostly on phones):
 *   < lg  horizontal row. Avatar left, name and meta beside it. Compact, so
 *         it costs two lines instead of pushing the first paragraph down.
 *   ≥ lg  stacked sticky rail in the 200px column. 64px circle on top.
 *
 * Guest authors (kind: "guest") render name and date only: no avatar, no
 * link, no role line. That difference is the point — see lib/authors.ts.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-05-24" → "May 24, 2026". Parsed as calendar parts, not Date(), so
 *  the rendered day never shifts with the server's timezone. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

type Props = {
  /** Slug from lib/authors.ts. */
  author: string;
  /** ISO YYYY-MM-DD. Same values the post feeds to buildBlogArticleSchema. */
  published: string;
  /** The date shown. Falls back to `published` when missing. */
  modified?: string;
  /** Whole minutes. Omit to hide. Computed by BlogPostBody, never by hand. */
  minutes?: number;
};

export default function AuthorByline({
  author: slug,
  published,
  modified,
  minutes,
}: Props) {
  const author = getAuthor(slug);
  const href = authorHref(author);
  // Every post shows one line, "Updated <date>", using the modified date
  // (2026-10-12 decision). `published` stays a prop so callers feed the same
  // values to the schema; it is only the fallback here.
  const shownDate = modified || published;
  const showReadTime =
    typeof minutes === "number" && minutes <= READ_TIME_CEILING_MINUTES;

  // Only items that exist (guest authors have no role; some posts have no read
  // time), so the row never has a doubled separator.
  const metaItems = [
    author.role,
    `Updated ${formatDate(shownDate)}`,
    showReadTime ? `${minutes} min read` : undefined,
  ].filter((item): item is string => Boolean(item));

  const name = <strong className="text-black font-semibold">{author.name}</strong>;

  return (
    <div className="lg:sticky lg:top-28 flex flex-row items-center gap-3.5 lg:flex-col lg:items-start lg:gap-0">
      {author.avatar && (
        <Image
          src={author.avatar}
          alt={author.name}
          width={64}
          height={64}
          sizes="64px"
          className="shrink-0 rounded-full object-cover w-11 h-11 lg:w-16 lg:h-16 lg:mb-4"
        />
      )}

      <div className="min-w-0 flex flex-col gap-0.5 lg:gap-1.5">
        <span className="font-body text-black/60 text-sm">
          by{" "}
          {href ? (
            <Link href={href} rel="author" className="hover:text-red transition-colors">
              {name}
            </Link>
          ) : (
            name
          )}
        </span>

        {/* Meta. On mobile one middot-separated row; on the lg rail one item
            per line. Every item carries a leading ::before middot, and the
            wrapper is pulled left by one dot's width inside an overflow-hidden
            parent, so the dot that lands at the start of a line (the first
            item, or an item that wrapped) is clipped instead of dangling. */}
        <span className="font-body text-black/40 text-xs block overflow-hidden lg:overflow-visible">
          <span className="flex flex-wrap items-baseline -ml-3 lg:ml-0 lg:flex-col lg:items-start lg:gap-y-1">
            {metaItems.map((item, i) => (
              <span
                key={i}
                className="relative pl-3 before:absolute before:left-[3px] before:content-['·'] lg:pl-0 lg:before:hidden"
              >
                {item}
              </span>
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
