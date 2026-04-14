/**
 * Structured data (JSON-LD) builders for EKUZO.
 *
 * Single source of truth for all Schema.org entities. Safe to import
 * from any server component. See GEO-SCHEMA-REPORT.md for rationale.
 *
 * NOTE ON TESTIMONIAL TRANSCRIPTS:
 * Transcripts are imported from lib/testimonialTranscripts.ts as plain
 * string literals. They used to be read at module load via fs.readFileSync
 * from public/testimonial-videos/*.txt, but that caused Next.js file
 * tracing to bundle the entire testimonial-videos directory (~420MB of
 * MP4s) into the serverless function, exceeding Netlify's 50MB limit.
 * Keep the transcripts inline — do NOT reintroduce fs access here.
 */
import { testimonialTranscripts } from "./testimonialTranscripts";

const SITE = "https://ekuzo.gg";
const ORG_ID = `${SITE}/#organization`;

// ─── Coach Person schemas ──────────────────────────────────────────────────
// These are referenced by @id from EducationalOrganization.founder and from
// each Course.hasCourseInstance.instructor array. They are emitted as
// top-level nodes in the root @graph so they exist in the entity graph
// independent of any single page.
const KARLIN_ID = `${SITE}/#coach-karlin`;
const SEBASTIEN_ID = `${SITE}/#coach-sebastien`;
const NURI_ID = `${SITE}/#coach-nuri`;

export const coachKarlinSchema = {
  "@type": "Person",
  "@id": KARLIN_ID,
  name: 'Karlin "Faith" Oei',
  jobTitle: "Founder",
  description:
    "Peak Challenger jungler in League of Legends — top 0.01% tier. Former national collegiate captain who won $80,000+ in esports scholarships through competitive play. Oversees the full EKUZO student experience.",
  sameAs: "https://www.linkedin.com/in/karlinoei/",
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/coach-karlin-faith.jpg`,
};

export const coachSebastienSchema = {
  "@type": "Person",
  "@id": SEBASTIEN_ID,
  name: 'Sebastien "ZzLegendary" DeMontigny',
  jobTitle: "Head Coach",
  description:
    "Professional esports coach who has coached at tier-1 organizations including Dignitas and Evil Geniuses. Elite-level competitive player. 4+ years experience specifically in youth esports coaching. Leads EKUZO's coaching staff and trains every coach on the team.",
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/coach-sebastien-ZzLegendary.png`,
};

export const coachNuriSchema = {
  "@type": "Person",
  "@id": NURI_ID,
  name: 'Nuri "Teemo Time" Je',
  jobTitle: "Coach",
  description:
    "Diamond-ranked Support player (top ~1% of League of Legends players). Community manager at the University of Texas at Austin and Alienware Ambassador. Background in public school teaching. One of EKUZO's cadre of collegiate esports athlete coaches.",
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/coach-nuri-je.png`,
};

// ─── Organization (EducationalOrganization) ────────────────────────────────
export const organizationSchema = {
  "@type": "EducationalOrganization",
  "@id": ORG_ID,
  name: "EKUZO",
  alternateName: "EKUZO — Every Gamer Deserves a Team",
  url: SITE,
  logo: {
    "@type": "ImageObject",
    url: `${SITE}/images/ekuzo-logo-red.svg`,
  },
  image: `${SITE}/images/og-default.jpg`,
  description:
    "EKUZO builds transformational esports programs for kids through structured practice, skilled coaching, and real competition.",
  foundingDate: "2021-01-01",
  email: "team@ekuzo.gg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "5617 Dolores Street",
    addressLocality: "Houston",
    addressRegion: "TX",
    postalCode: "77057",
    addressCountry: "US",
  },
  areaServed: ["United States", "North America"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "team@ekuzo.gg",
      availableLanguage: "en",
    },
    {
      "@type": "ContactPoint",
      contactType: "legal",
      email: "info@ekuzo.gg",
      availableLanguage: "en",
    },
  ],
  founder: { "@id": KARLIN_ID },
  knowsAbout: [
    "Esports coaching",
    "Youth gaming education",
    "Competitive video games",
    "Game-based learning",
    "Social-emotional learning",
    "League of Legends coaching",
    "Fortnite coaching",
    "Valorant coaching",
  ],
  sameAs: [
    "https://www.instagram.com/ekuzo.gg",
    "https://www.facebook.com/ekuzo.gg",
    "https://www.youtube.com/@ekuzogg",
    "https://www.linkedin.com/company/ekuzogg/",
    "https://www.tiktok.com/@ekuzo.gg",
    "https://x.com/ekuzogg",
  ],
};

// ─── WebSite (no fake SearchAction) ────────────────────────────────────────
export const websiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "EKUZO",
  description: "Every Gamer Deserves a Team",
  publisher: { "@id": ORG_ID },
  inLanguage: "en-US",
};

// ─── SiteNavigationElement (preserved from original) ───────────────────────
export const siteNavigationSchema = {
  "@type": "SiteNavigationElement",
  "@id": `${SITE}/#navigation`,
  name: "Main Navigation",
  hasPart: [
    {
      "@type": "WebPage",
      name: "EKUZO Camps",
      url: `${SITE}/programs/ekuzo-camps`,
      description:
        "Intensive 1-week summer esports camps with pro coaching, real teams, and daily tournaments.",
    },
    {
      "@type": "WebPage",
      name: "EKUZO Teams",
      url: `${SITE}/programs/ekuzo-teams`,
      description:
        "Semester-based esports program structured like sports with consistent teammates and coaches.",
    },
    {
      "@type": "WebPage",
      name: "EKUZO100",
      url: `${SITE}/programs/ekuzo100`,
      description: "4-week intro program. One month, $100, your first team.",
    },
    { "@type": "WebPage", name: "For Families", url: `${SITE}/parents` },
    { "@type": "WebPage", name: "For Schools", url: `${SITE}/schools` },
    { "@type": "WebPage", name: "FAQ", url: `${SITE}/faq` },
  ],
};

// ─── Root @graph used by app/layout.tsx ────────────────────────────────────
export const rootGraph = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    websiteSchema,
    siteNavigationSchema,
    coachKarlinSchema,
    coachSebastienSchema,
    coachNuriSchema,
  ],
};

// ─── Course schemas ────────────────────────────────────────────────────────
// Shared virtual location — all EKUZO programs are online. Reused across
// every Course.hasCourseInstance.location.
const VIRTUAL_LOCATION = {
  "@type": "VirtualLocation",
  url: SITE,
};

// Build a Review node from an inlined testimonial transcript. `itemReviewed`
// must be set to the enclosing Course's @id by the caller.
const buildTestimonialReview = (
  authorName: string,
  transcriptKey: keyof typeof testimonialTranscripts,
  courseId: string,
) => ({
  "@type": "Review",
  author: { "@type": "Person", name: authorName },
  reviewBody: testimonialTranscripts[transcriptKey],
  itemReviewed: { "@id": courseId },
});

const CAMPS_COURSE_ID = `${SITE}/programs/ekuzo-camps#course`;
const EKUZO100_COURSE_ID = `${SITE}/programs/ekuzo100#course`;
const TEAMS_COURSE_ID = `${SITE}/programs/ekuzo-teams#course`;

const sharedCourseFields = {
  "@context": "https://schema.org",
  "@type": "Course",
  provider: { "@id": ORG_ID },
  educationalLevel: "Beginner to Intermediate",
  inLanguage: "en",
};

export const ekuzoCampsCourseSchema = {
  ...sharedCourseFields,
  "@id": CAMPS_COURSE_ID,
  name: "EKUZO Camp",
  url: `${SITE}/programs/ekuzo-camps`,
  description:
    "Intensive 1-week online esports camp with pro coaching, real teams, and daily tournaments. Morning and afternoon slots available.",
  teaches: [
    "Esports coaching",
    "Game-based learning",
    "Social-emotional learning",
  ],
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT15H",
    location: VIRTUAL_LOCATION,
    startDate: "2026-05-18",
    endDate: "2026-08-06",
    description:
      "Weekly summer cohorts, Monday–Friday, 3 hours per day. Register for any week between May 18 and August 3, 2026.",
    instructor: [
      { "@id": KARLIN_ID },
      { "@id": SEBASTIEN_ID },
      { "@id": NURI_ID },
    ],
  },
  offers: {
    "@type": "Offer",
    price: "199",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    priceValidUntil: "2026-06-30",
    url: `${SITE}/programs/ekuzo-camps/register`,
  },
  review: [
    buildTestimonialReview("Becky", "beckyParent", CAMPS_COURSE_ID),
    buildTestimonialReview("Brad", "bradParentGirlGamer", CAMPS_COURSE_ID),
    buildTestimonialReview("Rajitha", "rajithaParent", CAMPS_COURSE_ID),
  ],
};

export const ekuzo100CourseSchema = {
  ...sharedCourseFields,
  "@id": EKUZO100_COURSE_ID,
  name: "EKUZO100",
  url: `${SITE}/programs/ekuzo100`,
  description:
    "4-week individual esports coaching program. One month, $100, your first team. Structured practice, coach-led, ~5 player teams.",
  teaches: [
    "Esports coaching",
    "Game-based learning",
    "Social-emotional learning",
  ],
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT12H",
    location: VIRTUAL_LOCATION,
    startDate: "2026-06-02",
    endDate: "2026-06-30",
    description:
      "4-week cohort starting Tuesday, June 2, 2026. Two 90-minute sessions per week.",
    instructor: [{ "@id": KARLIN_ID }, { "@id": SEBASTIEN_ID }],
  },
  offers: {
    "@type": "Offer",
    price: "100",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    priceValidUntil: "2026-06-30",
    url: `${SITE}/programs/ekuzo100/register`,
  },
  review: [
    buildTestimonialReview("EKUZO Student", "studentILearned", EKUZO100_COURSE_ID),
    buildTestimonialReview("EKUZO Student", "studentManOfMyWord", EKUZO100_COURSE_ID),
    buildTestimonialReview("EKUZO Student", "studentThankYouEkuzo", EKUZO100_COURSE_ID),
    buildTestimonialReview("EKUZO Student", "studentYouShouldJoin", EKUZO100_COURSE_ID),
  ],
};

export const ekuzoTeamsCourseSchema = {
  ...sharedCourseFields,
  "@id": TEAMS_COURSE_ID,
  name: "EKUZO Teams",
  url: `${SITE}/programs/ekuzo-teams`,
  description:
    "Semester-based esports program structured like sports, with consistent teammates, coach-led practice, and a real competitive season. Fall 2026 semester enrollment open.",
  teaches: [
    "Esports coaching",
    "Team coordination",
    "Game-based learning",
    "Social-emotional learning",
  ],
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT48H",
    location: VIRTUAL_LOCATION,
    startDate: "2026-08-31",
    endDate: "2026-12-18",
    description:
      "Fall 2026 semester. Two 90-minute sessions per week, ~16 weeks.",
    instructor: [{ "@id": KARLIN_ID }, { "@id": SEBASTIEN_ID }],
  },
  offers: [
    {
      "@type": "Offer",
      name: "Pay in full",
      price: "576",
      priceCurrency: "USD",
      description: "10% off — single payment for full semester",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2026-08-31",
      url: `${SITE}/programs/ekuzo-teams/register`,
    },
    {
      "@type": "Offer",
      name: "4-payment plan",
      price: "640",
      priceCurrency: "USD",
      description: "$160 × 4 monthly payments, Sep through Dec",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2026-08-31",
      url: `${SITE}/programs/ekuzo-teams/register`,
    },
  ],
  review: [
    buildTestimonialReview(
      "Laura Hogan, Mirus Academy",
      "lauraHoganMirusAcademy",
      TEAMS_COURSE_ID,
    ),
    buildTestimonialReview(
      "Debbie Potter, Monroe",
      "debbiePotterMonroe",
      TEAMS_COURSE_ID,
    ),
  ],
};

// ─── BreadcrumbList builder ────────────────────────────────────────────────
type Crumb = { name: string; path: string };

export function buildBreadcrumbSchema(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path}`,
    })),
  };
}

// ─── FAQPage builder ───────────────────────────────────────────────────────
type FAQItem = { question: string; answer: string };

export function buildFAQPageSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ─── VideoObject schemas for the 9 testimonial videos ──────────────────────
// Transcripts come from lib/testimonialTranscripts.ts (plain string literals,
// no fs access — see the top-of-file note).
type TestimonialMeta = {
  slug: string;
  name: string;
  role: string;
  transcriptKey: keyof typeof testimonialTranscripts;
  uploadDate: string;
};

const testimonials: TestimonialMeta[] = [
  { slug: "becky-parent", name: "Becky", role: "Parent", transcriptKey: "beckyParent", uploadDate: "2026-01-12" },
  { slug: "brad-parent-girl-gamer", name: "Brad", role: "Parent (girl gamer)", transcriptKey: "bradParentGirlGamer", uploadDate: "2026-01-27" },
  { slug: "debbie-potter-monroe", name: "Debbie Potter", role: "Director of Admissions, Robert F. Monroe Day School", transcriptKey: "debbiePotterMonroe", uploadDate: "2026-02-03" },
  { slug: "laura-hogan-mirus-academy", name: "Laura Hogan", role: "Administrator, Mirus Academy", transcriptKey: "lauraHoganMirusAcademy", uploadDate: "2026-02-16" },
  { slug: "rajitha-parent", name: "Rajitha", role: "Parent", transcriptKey: "rajithaParent", uploadDate: "2026-02-25" },
  { slug: "student-i-learned", name: "EKUZO Student", role: "Student", transcriptKey: "studentILearned", uploadDate: "2026-03-04" },
  { slug: "student-man-of-my-word", name: "EKUZO Student", role: "Student", transcriptKey: "studentManOfMyWord", uploadDate: "2026-03-12" },
  { slug: "student-thank-you-ekuzo", name: "EKUZO Student", role: "Student", transcriptKey: "studentThankYouEkuzo", uploadDate: "2026-03-19" },
  { slug: "student-you-should-join", name: "EKUZO Student", role: "Student", transcriptKey: "studentYouShouldJoin", uploadDate: "2026-03-27" },
];

const testimonialVideoNodes = testimonials.map((t) => {
  const transcript = testimonialTranscripts[t.transcriptKey] ?? "";
  const videoUrl = `${SITE}/testimonial-videos/${t.slug}.mp4`;
  const thumbnailUrl = `${SITE}/testimonial-videos/${t.slug}-poster.jpg`;
  const description = transcript
    ? transcript.slice(0, 280).trim() +
      (transcript.length > 280 ? "…" : "")
    : `Video testimonial from ${t.name}, ${t.role}, about EKUZO youth esports coaching.`;
  return {
    "@type": "VideoObject",
    "@id": `${videoUrl}#video`,
    name: `${t.name} — EKUZO Testimonial`,
    description,
    thumbnailUrl,
    uploadDate: t.uploadDate,
    contentUrl: videoUrl,
    publisher: { "@id": ORG_ID },
    transcript,
  };
});

// Consolidated into one @graph so the homepage emits a single <script> tag
// instead of nine — smaller HTML payload, identical semantics.
export const testimonialVideoGraph = {
  "@context": "https://schema.org",
  "@graph": testimonialVideoNodes,
};
