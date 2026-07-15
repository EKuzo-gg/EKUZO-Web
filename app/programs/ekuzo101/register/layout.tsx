import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | EKUZO 101 Summer Pilot",
  description: "Pick your weeks, register your gamer. No card required.",
  alternates: { canonical: "/programs/ekuzo101/register" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
