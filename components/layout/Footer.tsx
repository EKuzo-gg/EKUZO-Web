import Link from "next/link";
import ModalButton from "@/components/ui/ModalButton";

/* ─── Social icon SVGs ───────────────────────────────────────────────────── */
function IconTikTok() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const socialLinks = [
  { href: "https://www.tiktok.com/@ekuzogg",       label: "TikTok",    Icon: IconTikTok },
  { href: "https://www.instagram.com/ekuzogg/",    label: "Instagram", Icon: IconInstagram },
  { href: "https://www.linkedin.com/company/ekuzo",label: "LinkedIn",  Icon: IconLinkedIn },
  { href: "https://www.youtube.com/@ekuzogg",      label: "YouTube",   Icon: IconYouTube },
  { href: "https://x.com/ekuzogg",                 label: "X",         Icon: IconX },
  { href: "https://www.facebook.com/ekuzogg",      label: "Facebook",  Icon: IconFacebook },
];

// Flat link columns — matches Framer footer exactly
const footerColumns = [
  [
    { href: "/programs",  label: "Programs" },
    { href: "/ekuzo100",  label: "EKUZO 100" },
    { href: "/ekuzo-teams", label: "EKUZO Teams" },
  ],
  [
    { href: "/methodology", label: "Methodology" },
    { href: "/games",       label: "Games" },
    { href: "/blog",        label: "Blog" },
  ],
  [
    { href: "/parents",  label: "Parents" },
    { href: "/schools",  label: "Schools" },
    { href: "/faq",      label: "FAQ" },
  ],
  [
    { href: "/terms-of-service", label: "Terms of Service" },
    { href: "/privacy-policy",   label: "Privacy Policy" },
  ],
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer
      className="bg-white relative overflow-hidden pt-[130px]"
      style={{
        paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
        paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        paddingBottom: "calc(72vw * 0.82)",
      }}
    >

      {/* Top row — social + CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-[100px]">
        <div className="flex items-center gap-8">
          <span className="font-body text-base text-black">Find us online</span>
          <ul className="flex items-center gap-5">
            {socialLinks.map(({ href, label, Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-red transition-colors"
                >
                  <Icon />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <ModalButton modal="contact" variant="red-filled">
          Start a conversation
        </ModalButton>
      </div>

      {/* Flat nav columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-10 mb-[100px]">
        {footerColumns.map((col, ci) => (
          <ul key={ci} className="flex flex-col gap-4">
            {col.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-base text-black/70 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* Copyright */}
      <p className="font-body text-sm text-black/40">© All rights reserved.</p>

      {/* Giant EKUZO wordmark — bleeds full width at bottom */}
      <div
        className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-display text-black leading-[0.8]"
          style={{ fontSize: "clamp(8rem, 72vw, 128rem)" }}
        >
          EKUZO
        </span>
      </div>
    </footer>
  );
}
