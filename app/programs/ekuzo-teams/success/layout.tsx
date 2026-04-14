import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration Confirmed — EKUZO Teams",
  description: "Your EKUZO Teams registration is confirmed.",
  alternates: { canonical: "/programs/ekuzo-teams/success" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
