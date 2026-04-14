import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — EKUZO Camp",
  description: "Register for an EKUZO summer esports camp week.",
  alternates: { canonical: "/programs/ekuzo-camps/register" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
