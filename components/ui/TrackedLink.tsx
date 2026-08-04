"use client";

import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics";

/**
 * Client-component wrapper for non-register in-page links that need a GA
 * `cta_click` before navigation. Same shape and rationale as
 * TrackedRegisterLink: it exists so a server-rendered section can attach one
 * onClick without pulling the whole section into a client tree.
 *
 * Register CTAs should keep using TrackedRegisterLink — `register_click` is
 * the enrolment-intent metric and shouldn't be diluted with content clicks.
 */
export default function TrackedLink({
  cta,
  section,
  href,
  className,
  children,
}: {
  /** Stable slug for this link, e.g. "faq_link". */
  cta: string;
  /** GA section_id the link sits in, so clicks join to section_view. */
  section: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackCtaClick({ cta, section, destination: href })}
    >
      {children}
    </Link>
  );
}
