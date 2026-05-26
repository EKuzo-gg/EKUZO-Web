import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";
import ModalRenderer from "@/components/ui/ModalRenderer";
import StickyCTA from "@/components/ui/StickyCTA";
import NewsletterPopup from "@/components/ui/NewsletterPopup";
import CaptureAttribution from "@/components/analytics/CaptureAttribution";
import JsonLd from "@/components/JsonLd";
import { rootGraph } from "@/lib/schema";

const GA_MEASUREMENT_ID = "G-8LM45PX53W";
// Lifted to env so the server-side CAPI handler can read the same ID
// without it drifting. Fallback keeps prod safe if the env var is missing.
const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1284038230557204";

/*
 * Tungsten Narrow — personal/preview use (Hoefler & Co)
 * License before production launch: typography.com/fonts/tungsten/styles
 *
 * Split into two declarations to selectively preload only the Black (900)
 * weight, which is the only Tungsten weight used above the fold on any page.
 * Bold / Semibold / Medium load on demand when CSS references them.
 *
 * Rationale: see marketing/teams-redesign/11-home-lcp-postmortem.md §6.1.
 * The pre-split single declaration preloaded all 4 weights at High priority,
 * adding ~71 KiB of bandwidth contention to the LCP image's HTTP/2 window
 * on every pageload. Codebase-wide survey of non-900 Tungsten usage found
 * exactly one site (app/programs/ekuzo-camps/page.tsx line 525 uses
 * font-display + font-bold). Home page has zero non-900 usage.
 *
 * Cascade: both classes set --font-tungsten. tungstenBlack.variable is
 * applied AFTER tungstenOther.variable in the <html> className so Black's
 * family name wins the variable resolution. The Other @font-face rules
 * are still emitted (next/font injects them regardless of preload), so
 * the browser can still load Bold / Semibold / Medium on demand when an
 * element with that weight renders. The browser's bold-synthesis fallback
 * may briefly stand in for Bold on first paint of the ekuzo-camps Bold
 * usage; acceptable per display: swap.
 */
const tungstenOther = localFont({
  src: [
    { path: "../public/fonts/TungstenNarrow-Bold.otf",  weight: "700", style: "normal" },
    { path: "../public/fonts/TungstenNarrow-Semibold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/TungstenNarrow-Medium.otf", weight: "500", style: "normal" },
  ],
  variable: "--font-tungsten",
  display: "swap",
  preload: false,
});

const tungstenBlack = localFont({
  src: [
    { path: "../public/fonts/TungstenNarrow-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-tungsten",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ekuzo.gg"),
  title: {
    default: "EKUZO — Every Gamer Deserves a Team",
    template: "%s | EKUZO",
  },
  description:
    "EKUZO builds transformational esports programs for kids through structured practice, skilled coaching, and real competition.",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    title: "EKUZO — Every Gamer Deserves a Team",
    description: "Transformational esports coaching for youth gamers.",
    url: "https://ekuzo.gg",
    siteName: "EKUZO",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "EKUZO - Youth Esports Coaching Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EKUZO — Every Gamer Deserves a Team",
    description: "Transformational esports coaching for youth gamers.",
    images: ["https://ekuzo.gg/images/og-default.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${tungstenOther.variable} ${tungstenBlack.variable} h-full antialiased`}>
      <head>
        <JsonLd data={rootGraph} />

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {/* Microsoft Clarity — heatmaps + session recordings.
            Project ID is hardcoded because it's not a secret: Clarity sends
            it to every visitor's browser as plain text in the script tag
            below. Previously this was env-gated on
            NEXT_PUBLIC_CLARITY_PROJECT_ID, but on 2026-05-11 we discovered
            the env var was set in Netlify with the correct value yet wasn't
            reaching the build output (file hashes matched the prior build),
            so the gate kept evaluating to false in production. Hardcoding
            removes the moving part. Internal-team IP filtering is
            dashboard-side at clarity.microsoft.com → Settings → IP blocking.
            Full diagnosis:
            knowledge-base/logs/sessions/2026-05-11-camps-v1.1-monday-read.md */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "wml8wll5ua");`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-white text-black">
        <ModalProvider>
          <CaptureAttribution />
          {children}
          <ModalRenderer />
          <StickyCTA />
          {/* Newsletter popup is gated by env var so we can disable it
              site-wide without removing the component (reserved for re-
              enablement when re-engagement strategy warrants it). Default
              is disabled — set NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED=true
              in Netlify env to bring it back. */}
          {process.env.NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED === "true" && (
            <NewsletterPopup />
          )}
        </ModalProvider>
      </body>
    </html>
  );
}
