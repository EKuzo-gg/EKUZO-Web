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
  /** ISO YYYY-MM-DD. Same value the post feeds to buildBlogArticleSchema. */
  date: string;
  /** "Published" unless the post is maintained as an evergreen update. */
  dateLabel?: "Published" | "Updated";
  /** Whole minutes. Omit to hide. Computed by BlogPostBody, never by hand. */
  minutes?: number;
};

export default function AuthorByline({
  author: slug,
  date,
  dateLabel = "Published",
  minutes,
}: Props) {
  const author = getAuthor(slug);
  const href = authorHref(author);
  const showReadTime =
    typeof minutes === "number" && minutes <= READ_TIME_CEILING_MINUTES;

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

        {/* Meta. One middot-separated line on mobile, one item per line on the
            desktop rail — same DOM, the separators just drop out at lg. */}
        <span className="font-body text-black/40 text-xs flex flex-wrap items-baseline gap-x-1.5 lg:flex-col lg:items-start lg:gap-x-0 lg:gap-y-1">
          {author.role && (
            <>
              <span>{author.role}</span>
              <span aria-hidden="true" className="lg:hidden">·</span>
            </>
          )}
          <span>
            {dateLabel} {formatDate(date)}
          </span>
          {showReadTime && (
            <>
              <span aria-hidden="true" className="lg:hidden">·</span>
              <span>{minutes} min read</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
