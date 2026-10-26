import type { ReactNode } from "react";
import BlogPostTracking from "./BlogPostTracking";

// Wraps /blog and everything under it. Adds no markup; only mounts the post
// engagement tracking, which itself does nothing outside a post page.
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BlogPostTracking />
    </>
  );
}
