"use client";

import { trackRegisterClick } from "@/lib/analytics";

/**
 * Client-component wrapper for register CTAs that need to fire a GA
 * `register_click` event before navigation. Used on the camps marketing
 * page (server component) where adding onClick to a raw <a> would force
 * the entire section into a client tree.
 *
 * The `?cta=<source>` query param is the durable signal — it lands in the
 * register page mount, gets POSTed with the form, and ends up in Stripe
 * metadata + Beehiiv. The GA event is the realtime signal for monitoring.
 */
export default function TrackedRegisterLink({
  source,
  href,
  className,
  style,
  children,
}: {
  source: "hero" | "sticky" | "footer" | "header";
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={() => trackRegisterClick({ source })}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
