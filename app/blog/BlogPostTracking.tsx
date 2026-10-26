"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isBlogPostPath } from "@/lib/newsletterAb";
import { trackBlogLinkClick, trackBlogRead75, tagClarity } from "@/lib/analytics";

/**
 * Blog engagement tracking (handoff 2026-10-24-ship-robux-and-session-end-posts.md,
 * blog-wide item 2). Mounted once in app/blog/layout.tsx; does nothing outside a
 * post page (isBlogPostPath), so /blog and author pages are untouched.
 *
 *  - Clarity session tags page_type=blog and post_slug=<slug>.
 *  - GA4 blog_link_click on a click (never pointerdown or touchstart, so a phone
 *    scroll that starts on a link does not count) of a same-site link in the post
 *    or its Keep Reading cards. Nav, footer and dialogs (the Season 01 popup) are
 *    skipped: they have their own events.
 *  - GA4 blog_read_75 once per post view, when the bottom of the screen passes 75%
 *    of the article. Only a scroll can fire it, and scrolls in the first 800 ms
 *    are ignored, so page load and the browser's own scroll restoration do not
 *    count.
 *
 * Nothing about the reader goes out: only the post slug, the link's path and a
 * link type. Every call is guarded in lib/analytics.ts.
 */
const SETTLE_MS = 800;

function linkType(path: string): string {
  if (path === "/parents" || path.startsWith("/parents/")) return "parents";
  if (path.startsWith("/blog/author/")) return "author";
  if (path === "/blog" || path === "/blog/") return "blog_index";
  if (path.startsWith("/blog/")) return "post";
  if (path.startsWith("/programs") || path.startsWith("/season1")) return "program";
  return "other_internal";
}

export default function BlogPostTracking() {
  const pathname = usePathname() || "";

  useEffect(() => {
    if (!isBlogPostPath(pathname)) return;
    const slug = pathname.replace(/^\/blog\//, "").replace(/\/$/, "");

    tagClarity("page_type", "blog");
    tagClarity("post_slug", slug);

    // Capture phase: next/link calls preventDefault on its own click handler,
    // so a bubbling listener never sees an unprevented click on a real link.
    // Modified clicks (new tab, new window, download) are not counted.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.closest("nav, header, footer, [role='dialog']")) return;
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // in-page anchor
      trackBlogLinkClick({
        postSlug: slug,
        linkPath: url.pathname,
        linkType: linkType(url.pathname),
      });
    };

    let readSent = false;
    const mountedAt = Date.now();
    const onScroll = () => {
      if (readSent || Date.now() - mountedAt < SETTLE_MS) return;
      const article = document.querySelector("article");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      if (rect.height <= 0) return;
      const seen = (window.innerHeight - rect.top) / rect.height;
      if (seen >= 0.75) {
        readSent = true;
        trackBlogRead75({ postSlug: slug });
        window.removeEventListener("scroll", onScroll);
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
