import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EKUZO x Woodward: A Free Month for Woodward Families",
  description:
    "A Woodward employee benefit: a free month of EKUZO 101, our coached intro esports course for kids ages 10 to 18. Sign up free. No payment, no commitment.",
  alternates: { canonical: "/woodward" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
