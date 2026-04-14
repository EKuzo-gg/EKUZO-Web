import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — EKUZO100",
  description: "Register for the EKUZO100 4-week intro program.",
  alternates: { canonical: "/programs/ekuzo100/register" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
