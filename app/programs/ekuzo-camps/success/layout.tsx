import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration Confirmed — EKUZO Camp",
  description: "Your EKUZO Camp registration is confirmed.",
  alternates: { canonical: "/programs/ekuzo-camps/success" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
