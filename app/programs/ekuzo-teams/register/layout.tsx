import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — EKUZO Teams",
  description: "Register for the EKUZO Teams semester-based esports program.",
  alternates: { canonical: "/programs/ekuzo-teams/register" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
