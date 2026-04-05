import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";
import ModalRenderer from "@/components/ui/ModalRenderer";
import StickyCTA from "@/components/ui/StickyCTA";
import NewsletterPopup from "@/components/ui/NewsletterPopup";

/*
 * Tungsten Narrow — personal/preview use (Hoefler & Co)
 * License before production launch: typography.com/fonts/tungsten/styles
 */
const tungsten = localFont({
  src: [
    { path: "../public/fonts/TungstenNarrow-Black.otf", weight: "900", style: "normal" },
    { path: "../public/fonts/TungstenNarrow-Bold.otf",  weight: "700", style: "normal" },
    { path: "../public/fonts/TungstenNarrow-Semibold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/TungstenNarrow-Medium.otf", weight: "500", style: "normal" },
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
  title: {
    default: "EKUZO — Every Gamer Deserves a Team",
    template: "%s | EKUZO",
  },
  description:
    "EKUZO builds transformational esports programs for kids through structured practice, skilled coaching, and real competition.",
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
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://ekuzo.gg/#organization",
      name: "EKUZO",
      url: "https://ekuzo.gg",
      logo: {
        "@type": "ImageObject",
        url: "https://ekuzo.gg/images/ekuzo-logo-red.svg",
      },
      description:
        "EKUZO builds transformational esports programs for kids through structured practice, skilled coaching, and real competition.",
      sameAs: [
        "https://www.instagram.com/ekuzo.gg",
        "https://www.facebook.com/ekuzo.gg",
        "https://www.youtube.com/@ekuzogg",
        "https://discord.gg/ekuzo",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://ekuzo.gg/#website",
      url: "https://ekuzo.gg",
      name: "EKUZO",
      description: "Every Gamer Deserves a Team",
      publisher: { "@id": "https://ekuzo.gg/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://ekuzo.gg/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://ekuzo.gg/#navigation",
      name: "Main Navigation",
      hasPart: [
        {
          "@type": "WebPage",
          name: "EKUZO Camps",
          url: "https://ekuzo.gg/programs/ekuzo-camps",
          description: "Intensive 1-week summer esports camps with pro coaching, real teams, and daily tournaments.",
        },
        {
          "@type": "WebPage",
          name: "EKUZO Teams",
          url: "https://ekuzo.gg/programs/ekuzo-teams",
          description: "Semester-based esports program structured like sports with consistent teammates and coaches.",
        },
        {
          "@type": "WebPage",
          name: "EKUZO100",
          url: "https://ekuzo.gg/programs/ekuzo100",
          description: "4-week intro program. One month, $100, your first team.",
        },
        {
          "@type": "WebPage",
          name: "For Families",
          url: "https://ekuzo.gg/parents",
        },
        {
          "@type": "WebPage",
          name: "For Schools",
          url: "https://ekuzo.gg/schools",
        },
        {
          "@type": "WebPage",
          name: "FAQ",
          url: "https://ekuzo.gg/faq",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${tungsten.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black">
        <ModalProvider>
          {children}
          <ModalRenderer />
          <StickyCTA />
          <NewsletterPopup />
        </ModalProvider>
      </body>
    </html>
  );
}
