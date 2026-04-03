import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";
import ModalRenderer from "@/components/ui/ModalRenderer";
import StickyCTA from "@/components/ui/StickyCTA";

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
        url: "https://ekuzo.gg/images/og-default.png",
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
    images: ["https://ekuzo.gg/images/og-default.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${tungsten.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-black">
        <ModalProvider>
          {children}
          <ModalRenderer />
          <StickyCTA />
        </ModalProvider>
      </body>
    </html>
  );
}
