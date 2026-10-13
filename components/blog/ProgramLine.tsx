import Link from "next/link";

/**
 * The shared program line: the one place a blog post says what EKUZO runs and
 * points at /programs. Frozen copy (blog refresh 2026-10); change it here and
 * every post that uses it follows. No product name, price or season on
 * purpose, so it survives program and cart changes.
 *
 * Renders as an italic editor's line set apart from the body, outside any
 * guest author's text. It is a plain <p> that inherits the .blog-content prose
 * styles (size, line-height, red links), matching the existing italic editor's
 * lines on the K1NG post.
 */
export const PROGRAM_LINE = {
  text: "EKUZO runs coached esports teams for kids ages 10 to 17.",
  linkText: "See the current programs",
  href: "/programs",
} as const;

export default function ProgramLine() {
  return (
    <p className="italic text-black/60 border-t border-black/10 pt-5">
      {PROGRAM_LINE.text}{" "}
      <Link href={PROGRAM_LINE.href}>{PROGRAM_LINE.linkText}</Link>.
    </p>
  );
}
