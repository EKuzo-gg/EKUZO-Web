/**
 * Structured data (JSON-LD) builders for EKUZO.
 *
 * Single source of truth for all Schema.org entities. Server-only.
 * See GEO-SCHEMA-REPORT.md in the repo root for rationale.
 */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://ekuzo.gg";
const ORG_ID = `${SITE}/#organization`;

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
  foundingDate: "2021",
  email: "team@ekuzo.gg",
  founder: {
    "@type": "Person",
    name: "Karlin Oei",
    sameAs: "https://www.linkedin.com/in/karlinoei/",
  },
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
  "@graph": [organizationSchema, websiteSchema, siteNavigationSchema],
};

// ─── Course schemas ────────────────────────────────────────────────────────
const sharedCourseFields = {
  "@context": "https://schema.org",
  "@type": "Course",
  provider: { "@id": ORG_ID },
  educationalLevel: "Beginner to Intermediate",
  inLanguage: "en",
};

export const ekuzoCampsCourseSchema = {
  ...sharedCourseFields,
  "@id": `${SITE}/programs/ekuzo-camps#course`,
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
    description: "One-week camp, 3 hours per day, Monday–Friday",
  },
  offers: {
    "@type": "Offer",
    price: "199",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    priceValidUntil: "2026-06-30",
    url: `${SITE}/programs/ekuzo-camps/register`,
  },
};

export const ekuzo100CourseSchema = {
  ...sharedCourseFields,
  "@id": `${SITE}/programs/ekuzo100#course`,
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
    description: "4-week program, two 90-minute sessions per week",
  },
  offers: {
    "@type": "Offer",
    price: "100",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    priceValidUntil: "2026-06-30",
    url: `${SITE}/programs/ekuzo100/register`,
  },
};

export const ekuzoTeamsCourseSchema = {
  ...sharedCourseFields,
  "@id": `${SITE}/programs/ekuzo-teams#course`,
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
    startDate: "2026-08-31",
    description:
      "Fall 2026 semester. Two 90-minute sessions per week, ~16 weeks.",
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
// Captions are read from public/testimonial-videos/ at module load time and
// used as the `transcript` field on each VideoObject.
type TestimonialMeta = {
  slug: string;
  name: string;
  role: string;
  captionFile: string;
};

const testimonials: TestimonialMeta[] = [
  {
    slug: "becky-parent",
    name: "Becky",
    role: "Parent",
    captionFile: "Becky (Parent) Testimonial.txt",
  },
  {
    slug: "brad-parent-girl-gamer",
    name: "Brad",
    role: "Parent (girl gamer)",
    captionFile: "Brad (Parent) Testimonial (Girl Gamer).txt",
  },
  {
    slug: "debbie-potter-monroe",
    name: "Debbie Potter",
    role: "Director of Admissions, Robert F. Monroe Day School",
    captionFile: "Debbie Potter (Monroe) Testimonial.txt",
  },
  {
    slug: "laura-hogan-mirus-academy",
    name: "Laura Hogan",
    role: "Administrator, Mirus Academy",
    captionFile: "Laura Hogan (Ceo Mirus Academy) Testimonial.txt",
  },
  {
    slug: "rajitha-parent",
    name: "Rajitha",
    role: "Parent",
    captionFile: "Rajitha (Parent) Testimonial.txt",
  },
  {
    slug: "student-i-learned",
    name: "EKUZO Student",
    role: "Student",
    captionFile: "Student Testimonial (I Learned).txt",
  },
  {
    slug: "student-man-of-my-word",
    name: "EKUZO Student",
    role: "Student",
    captionFile: "Student Testimonial (Man of My Word) .txt",
  },
  {
    slug: "student-thank-you-ekuzo",
    name: "EKUZO Student",
    role: "Student",
    captionFile: "Student Testimonial (Thank You Ekuzo).txt",
  },
  {
    slug: "student-you-should-join",
    name: "EKUZO Student",
    role: "Student",
    captionFile: "Student Testimonial (You Should Join).txt",
  },
];

function readCaption(filename: string): string {
  try {
    const full = path.join(
      process.cwd(),
      "public",
      "testimonial-videos",
      filename,
    );
    return fs.readFileSync(full, "utf8").trim();
  } catch {
    return "";
  }
}

// NOTE: uploadDate is a placeholder (2024-01-01). Replace with real recording
// dates once we have them — Google may flag placeholder dates as low-signal.
const testimonialVideoNodes = testimonials.map((t) => {
  const transcript = readCaption(t.captionFile);
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
    uploadDate: "2024-01-01",
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
