import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { fetchSquadOwner, hasWeekPassed } from "@/lib/squad";

// Personal invite links — not indexable. Canonical is relative to
// metadataBase (https://ekuzo.gg) set in app/layout.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "Join a team — EKUZO Camp",
    description: "Personal invite link to join a friend's team at EKUZO Camp.",
    alternates: { canonical: `/squad/${token}` },
    robots: { index: false, follow: false },
  };
}

export default async function SquadTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const owner = await fetchSquadOwner(token);

  // State 3: unknown / invalid token
  if (!owner) {
    return (
      <Layout>
        <Hero
          heading="THIS TEAM LINK IS NO LONGER AVAILABLE"
          subhead="Check out our upcoming programs — there's always another camp on the horizon."
          ctaLabel="SEE UPCOMING PROGRAMS"
          ctaHref="/programs"
        />
      </Layout>
    );
  }

  // State 2: week already ran
  if (hasWeekPassed(owner.week_dates)) {
    return (
      <Layout>
        <Hero
          heading="THIS TEAM'S CAMP WEEK HAS ALREADY HAPPENED"
          subhead="Check out our upcoming programs — there's always another camp on the horizon."
          ctaLabel="SEE UPCOMING PROGRAMS"
          ctaHref="/programs"
        />
      </Layout>
    );
  }

  // State 1: valid token, week upcoming
  const weekNum = owner.week_label.replace(/\D/g, "");
  return (
    <Layout>
      <Hero
        heading={`JOIN ${owner.owner_gamer_name.toUpperCase()}'S TEAM`}
        subhead={`EKUZOCAMP is a week long esports camp for beginners to intermediate players. However, it will challenge all skill levels.`}
        detail={`EKUZO Camp — Week ${weekNum} (${owner.week_dates}) ${owner.slot}`}
        ctaLabel="REGISTER NOW"
        ctaHref={`/programs/ekuzo-camps/register?squad=${encodeURIComponent(token)}`}
      />
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav variant="light" />
      {children}
      <Footer hideTornPaper />
    </>
  );
}

function Hero({
  heading,
  subhead,
  detail,
  ctaLabel,
  ctaHref,
}: {
  heading: string;
  subhead: string;
  detail?: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="bg-white">
      <div className="max-w-[1232px] mx-auto px-6 sm:px-10 py-24 md:py-32 flex flex-col items-start gap-8">
        <h1
          className="font-display uppercase text-black leading-[0.85]"
          style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
        >
          {heading}
        </h1>
        <p
          className="font-body text-[#4b5563] max-w-[640px]"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)", lineHeight: "1.6" }}
        >
          {subhead}
        </p>
        {detail && (
          <p
            className="font-body font-bold text-black max-w-[640px]"
            style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)", lineHeight: "1.5" }}
          >
            {detail}
          </p>
        )}
        <Link
          href={ctaHref}
          className="inline-block font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150"
          style={{ fontSize: "18px", lineHeight: "28px", padding: "20px 32px" }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
