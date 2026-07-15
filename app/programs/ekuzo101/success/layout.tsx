import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're In - EKUZO 101 Summer Pilot",
  description: "Your registration is confirmed.",
  alternates: { canonical: "/programs/ekuzo101/success" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
