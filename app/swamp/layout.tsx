import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EKUZO x UF League — Summer Swamp Showdown 2026",
  description:
    "EKUZO is every gamer's dream starting point: team, competition, and growth. Join the Gaming Matters newsletter and our Discord community.",
  alternates: { canonical: "/swamp" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
