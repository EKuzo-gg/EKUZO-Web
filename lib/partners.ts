/**
 * Partner landing pages — data module.
 *
 * This is the single source of truth for the /partners/[slug] pages.
 * Adding a new partner = add a new `Partner` object to the `partners`
 * record below. The page layout is driven entirely by this data via
 * `components/partners/PartnerLanding.tsx` — you should not need to touch
 * the template to launch a new partner.
 *
 * Audience note: these pages pitch the EKUZO partnership to *other*
 * chapters/organizations of the same partner (e.g. other Boys & Girls
 * Clubs). The proof point is an existing live partnership; the CTA is a
 * partnership conversation (contact modal), not a consumer enrollment.
 *
 * PLACEHOLDER ASSETS: Copy and imagery below are drafted placeholders.
 * Fields marked `// PLACEHOLDER` reuse existing site imagery as stand-ins
 * and/or contain draft copy — swap in real partner-approved assets and
 * quotes before this goes to production. `logoText` renders as a styled
 * text block so there is no broken-image request until a real logo lands.
 */

export type PartnerFAQ = { question: string; answer: string };
export type PartnerCard = { title: string; body: string; icon: string };
export type PartnerStat = { value: string; label: string };

export type Partner = {
  slug: string;
  /** Full partner name, e.g. "Boys & Girls Club". */
  name: string;

  // ── Hero ──────────────────────────────────────────────
  heroEyebrow: string;
  /** Display headline (Tungsten). Kept short — it renders very large. */
  heroHeadline: string;
  heroSubhead: string;
  /** Rendered as a styled text placeholder until a real logo asset exists. */
  logoText: string;

  // ── Partnership intro / proof ─────────────────────────
  introEyebrow: string;
  introHeading: string;
  /** 1–3 short paragraphs. */
  introBody: string[];

  // ── Value props ───────────────────────────────────────
  valueHeading: string;
  valueIntro: string;
  valueCards: PartnerCard[];

  // ── How it works ──────────────────────────────────────
  howHeading: string;
  howSteps: PartnerCard[];

  // ── Outcomes ──────────────────────────────────────────
  outcomesHeading: string;
  /** Whole-number/short stat callouts. */
  outcomes: PartnerStat[];
  /** Short caveat/source line under the stats. */
  outcomesNote?: string;

  // ── Quote ─────────────────────────────────────────────
  quote: { text: string; name: string; role: string };

  // ── FAQ ───────────────────────────────────────────────
  faqs: PartnerFAQ[];

  // ── Footer CTA ────────────────────────────────────────
  ctaHeading: string;
  ctaLabel: string;

  // ── SEO ───────────────────────────────────────────────
  metaTitle: string;
  metaDescription: string;

  // ── Hero imagery ──────────────────────────────────────
  /** Full-bleed photographic hero background. */
  heroBg: string;
  /** Decorative paint stain, lower-left of the hero. */
  heroStainLeft: string;
  /** Decorative paint stain, upper-right of the hero. */
  heroStainRight: string;

  // ── Imagery (PLACEHOLDER stand-ins) ───────────────────
  introImage: string; // PLACEHOLDER
  footerImage: string; // PLACEHOLDER
};

const boysAndGirlsClub: Partner = {
  slug: "boys-and-girls-club",
  name: "Boys & Girls Club",

  heroEyebrow: "PARTNER SPOTLIGHT",
  heroHeadline: "ESPORTS BUILT FOR THE CLUB", // PLACEHOLDER copy
  heroSubhead:
    "EKUZO turns the games your members already love into structured growth — and it's live now at the Boys & Girls Club of Boston.", // PLACEHOLDER copy
  logoText: "BOYS & GIRLS CLUB", // PLACEHOLDER — swap for real logo asset

  introEyebrow: "THE PARTNERSHIP",
  introHeading: "Proven in Boston. Ready for your club.",
  introBody: [
    "In Boston, EKUZO and the Boys & Girls Club came together around a simple truth: the kids already love gaming. The question was never how to get them interested — it was how to turn that passion into something that builds them up.", // PLACEHOLDER copy
    "Together we built a program that meets members where they are and channels their energy into teamwork, communication, and confidence. Now we're bringing that same partnership to Clubs across the country.", // PLACEHOLDER copy
  ],

  valueHeading: "What EKUZO brings to your Club",
  valueIntro:
    "Clubs don't partner with EKUZO because they want esports. They partner because they're trying to reach more kids, deepen engagement, and show real outcomes — without adding staff or overhead.", // PLACEHOLDER copy
  valueCards: [
    {
      title: "Reaches the kids you can't",
      body: "Gaming pulls in members who don't show up for anything else. Esports becomes the door into your other programs.", // PLACEHOLDER copy
      icon: "/icons/youth.svg",
    },
    {
      title: "Turnkey to run",
      body: "EKUZO coaches lead every session remotely. Your staff supervise the room — we handle curriculum, coaching, and competition.", // PLACEHOLDER copy
      icon: "/icons/easy.svg",
    },
    {
      title: "Youth development first",
      body: "Every session is built around communication, leadership, and reflection — mapped to the outcomes your Club already cares about.", // PLACEHOLDER copy
      icon: "/icons/leadership.svg",
    },
    {
      title: "Safe by design",
      body: "Coach-led, recorded sessions and actively moderated communication. Coaches are trained in youth safety.", // PLACEHOLDER copy
      icon: "/icons/heart.svg",
    },
    {
      title: "Fits your space",
      body: "Runs on the computers you already have. No new hardware, no new hires, no reshuffling your facility.", // PLACEHOLDER copy
      icon: "/icons/run-first.svg",
    },
    {
      title: "Impact you can report",
      body: "Attendance, engagement, and belonging you can put in front of your board and your funders.", // PLACEHOLDER copy
      icon: "/icons/trophy.svg",
    },
  ],

  howHeading: "How the partnership works",
  howSteps: [
    {
      title: "We scope it together",
      body: "A short conversation about your space, schedule, and the members you most want to reach.", // PLACEHOLDER copy
      icon: "/icons/handshake.svg",
    },
    {
      title: "We bring the coaches",
      body: "EKUZO's trained coaches run structured sessions two to three times a week — fully remote.", // PLACEHOLDER copy
      icon: "/icons/swords.svg",
    },
    {
      title: "Your staff supervise",
      body: "A Club proctor keeps the room; EKUZO handles everything happening on the screen.", // PLACEHOLDER copy
      icon: "/icons/team.svg",
    },
    {
      title: "Members grow",
      body: "Kids practice, compete, and reflect — and it shows up in attendance, engagement, and belonging.", // PLACEHOLDER copy
      icon: "/icons/enthusiasm.svg",
    },
  ],

  outcomesHeading: "What partners see in their members",
  outcomes: [
    { value: "+7.3", label: "more days attended per year" }, // PLACEHOLDER stat
    { value: "33.5%", label: "lower absence rates" }, // PLACEHOLDER stat
    { value: "90%", label: "of members aren't in any other activity" }, // PLACEHOLDER stat
    { value: "1", label: "staff proctor needed per session" }, // PLACEHOLDER stat
  ],
  outcomesNote:
    "Placeholder figures shown for layout — replace with Boston partnership results before launch.", // PLACEHOLDER

  quote: {
    text: "Our members show up for EKUZO — and once they're here, they start showing up for everything else.", // PLACEHOLDER quote
    name: "Josh Davis",
    role: "Boys & Girls Club of Boston",
  },

  faqs: [
    {
      question: "What does our Club need to provide?",
      answer:
        "A space with computers (or member devices), internet access, and a staff proctor to supervise sessions. EKUZO coaches handle the coaching remotely.", // PLACEHOLDER copy
    },
    {
      question: "How much staff time does this take?",
      answer:
        "Minimal. One staff member supervises the room — no prep, no gaming expertise, and no curriculum to build. EKUZO runs the session end to end.", // PLACEHOLDER copy
    },
    {
      question: "Is it safe for our members?",
      answer:
        "Yes. All sessions are coach-led and recorded, every communication channel is actively moderated, and coaches are trained in youth safety. Members agree to a Code of Conduct.", // PLACEHOLDER copy
    },
    {
      question: "What games do members play?",
      answer:
        "Today, EKUZO trains on League of Legends. It's free-to-play, runs on modest machines, and offers the deep teamwork and strategy the EKUZO curriculum is built around.", // PLACEHOLDER copy
    },
    {
      question: "What does it cost, and how do we start?",
      answer:
        "Club partnerships are personalized to each location's space, schedule, and goals, so we prefer to start with a conversation rather than a fixed price. Reach out and we'll find the right fit together.", // PLACEHOLDER copy
    },
  ],

  ctaHeading: "Bring EKUZO to your Boys & Girls Club",
  ctaLabel: "Start the conversation",

  metaTitle: "EKUZO × Boys & Girls Club — Partner Program",
  metaDescription:
    "EKUZO brings structured, coach-led esports to Boys & Girls Clubs — reaching more members, deepening engagement, and driving real youth-development outcomes. Live in Boston.",

  heroBg: "/images/bcbg-hero.jpg",
  heroStainLeft: "/images/left-stain.png",
  heroStainRight: "/images/right-stain.png",
  introImage: "/images/community-group.png", // PLACEHOLDER
  footerImage: "/images/coach-collage@2x.png", // PLACEHOLDER
};

export const partners: Record<string, Partner> = {
  [boysAndGirlsClub.slug]: boysAndGirlsClub,
};

export const partnerList: Partner[] = Object.values(partners);

export function getPartner(slug: string): Partner | undefined {
  return partners[slug];
}
