import type { ReactNode } from "react";
import AuthorByline from "./AuthorByline";
import BlogContent from "./BlogContent";
import { readingTimeMinutes } from "@/lib/readingTime";

/**
 * The byline rail + article body of a blog post. Added 2026-07-28 so read
 * time can be computed from the post body itself rather than hand-maintained
 * per post: the children pass through here on the way to BlogContent, so the
 * word count is always the copy that actually shipped.
 *
 * Replaces the grid + hand-copied byline + <BlogContent> that each post used
 * to spell out for itself.
 */
export default function BlogPostBody({
  author,
  date,
  dateLabel,
  children,
}: {
  author: string;
  date: string;
  dateLabel?: "Published" | "Updated";
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16 items-start">
      <AuthorByline
        author={author}
        date={date}
        dateLabel={dateLabel}
        minutes={readingTimeMinutes(children)}
      />
      <BlogContent>{children}</BlogContent>
    </div>
  );
}
