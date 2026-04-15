import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration Confirmed — EKUZO100",
  description: "Your EKUZO100 registration is confirmed.",
  alternates: { canonical: "/programs/ekuzo100/success" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
