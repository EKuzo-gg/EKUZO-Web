/**
 * Individual blog post page.
 *
 * Posts are static — no CMS. To publish a new post:
 *   1. Create a new file at app/blog/your-slug/page.tsx
 *   2. Export a default React component with the post content
 *   3. Export a `metadata` object with title + description
 *   4. Add the post to the index in app/blog/page.tsx
 *
 * This [slug] route is a catch-all fallback that renders a
 * "not found" state for any slug that doesn't have its own
 * dedicated page file.
 *
 * TODO: Once posts exist, remove this file and replace with
 *       individual post files (e.g. app/blog/why-every-gamer/page.tsx)
 *       or implement generateStaticParams + MDX if volume grows.
 */

import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function BlogPost() {
  // All real posts will have their own page.tsx file — this route
  // should never match a real slug.
  notFound();
}
