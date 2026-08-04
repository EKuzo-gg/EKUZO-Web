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
export const KARLIN_ID = `${SITE}/#coach-karlin`;
const SEBASTIEN_ID = `${SITE}/#coach-sebastien`;
const NURI_ID = `${SITE}/#coach-nuri`;

export const coachKarlinSchema = {
  "@type": "Person",
  "@id": KARLIN_ID,
  name: "Karlin Oei",
  alternateName: "Faith",
  jobTitle: "Founder",
  description:
    "Founder of EKUZO. Former national collegiate esports captain who earned $80,000+ in scholarships; builds EKUZO as the structured, coached environment he didn't have growing up.",
  knowsAbout: [
    "youth esports",
    "esports coaching",
    "League of Legends",
    "youth development",
    "structured gaming",
    "screen time",
    "online safety for kids",
  ],
  sameAs: ["https://www.linkedin.com/in/karlinoei/"],
  worksFor: { "@id": ORG_ID },
  // 1400px derivative of the 6349x4312 / 10.2 MB original, same crop intent
  // (2026-07-28). The original is no longer served anywhere on the blog.
  image: `${SITE}/images/authors/coach-karlin-faith-1400.jpg`,
  url: `${SITE}/blog/author/karlin-oei`,
};

export const coachSebastienSchema = {
  "@type": "Person",
  "@id": SEBASTIEN_ID,
  name: 'Sebastien "ZzLegendary" DeMontigny',
  jobTitle: "Head Coach",
  description:
    "Professional esports coach who has coached at tier-1 organizations including Dignitas and Evil Geniuses. Elite-level competitive player. 4+ years experience specifically in youth esports coaching. Leads EKUZO's coaching staff and trains every coach on the team.",
  sameAs: "https://lol.fandom.com/wiki/Zz_(Sebastien_Demontigny)",
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/coach-sebastien-ZzLegendary.webp`,
};

export const coachNuriSchema = {
  "@type": "Person",
  "@id": NURI_ID,
  name: 'Nuri "Teemo Time" Je',
  jobTitle: "Coach",
  description:
    "Diamond-ranked Support player (top ~1% of League of Legends players). Community manager at the University of Texas at Austin and Alienware Ambassador. Background in public school teaching. One of EKUZO's cadre of collegiate esports athlete coaches.",
  sameAs: "https://www.linkedin.com/in/nuri-je/",
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/coach-nuri-je.webp`,
};

// ─── Author Person schemas (blog bylines) ──────────────────────────────────
// Jamie Fitch is a blog author, not an Org-structural entity like the coaches,
// but he follows the same pattern: one canonical Person node in the root @graph
// referenced by @id from his ProfilePage (author page) and from the `author` of
// any BlogPosting he writes. Keep "parent" out of jobTitle/description — it
// lives on-page only (byline sub-label + author bio). jobTitle is "CEO".
export const JAMIE_ID = `${SITE}/#person-jamie`;

export const personJamieFitch = {
  "@type": "Person",
  "@id": JAMIE_ID,
  name: "Jamie Fitch",
  jobTitle: "CEO",
  description:
    "CEO of EKUZO, a youth esports coaching program. An edtech founder who previously raised over $40M, scaled, and sold an education company, and now builds and invests in companies focused on learning, youth development, and impact.",
  knowsAbout: [
    "youth esports",
    "esports coaching",
    "youth development",
    "structured gaming",
    "online friendship and social connection",
    "screen time",
    "parenting gamers",
    "education technology",
  ],
  sameAs: ["https://www.linkedin.com/in/jamiefitch/", "https://fitch.vc"],
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/jamie-fitch.jpg`,
  url: `${SITE}/blog/author/jamie-fitch`,
};

// Muhammad Hossain: EKUZO coach and the author of the Kassi bundle.
// IN `rootGraph` since 2026-07-31, when the bundle went public. He was held
// out of it from 2026-07-28 while the posts were under embargo, because
// rootGraph is emitted on every page of the site and would have broadcast a
// new author node before the pieces flipped; his author page inlined the node
// instead. That inline copy (`personNode` on his lib/authors.ts entry) was
// removed in the same commit, so the node emits exactly once.
// No `sameAs`: he has no public profile we've confirmed. Don't invent one.
export const MUHAMMAD_ID = `${SITE}/#person-muhammad`;

export const personMuhammadHossain = {
  "@type": "Person",
  "@id": MUHAMMAD_ID,
  name: "Muhammad Hossain",
  jobTitle: "Coach",
  description:
    "EKUZO coach and a senior English major at Texas A&M University. He coaches kids in League of Legends and interviews parents about gaming for EKUZO's listening project.",
  knowsAbout: [
    "esports coaching",
    "League of Legends",
    "parenting gamers",
    "military families and gaming",
    "screen time",
  ],
  // `affiliation`, not `alumniOf` — he is a current student, not a graduate.
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "Texas A&M University",
  },
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/muhammad-hossain.jpg`,
  url: `${SITE}/blog/author/muhammad-hossain`,
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
  foundingDate: "2021",
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
    personJamieFitch,
    personMuhammadHossain,
  ],
};

// ─── Course schemas ────────────────────────────────────────────────────────
// Shared virtual location — all EKUZO programs are online. Reused across
// every Course.hasCourseInstance.location.
const VIRTUAL_LOCATION = {
  "@type": "VirtualLocation",
  url: SITE,
};

// NOTE: We deliberately do NOT emit `Review` nodes on the Course schemas.
// Our testimonials are qualitative video quotes — we don't collect 1–5 star
// ratings, so a valid Review snippet (which Google requires a `reviewRating`
// for, plus an `aggregateRating` when multiple reviews are present) can't be
// produced without fabricating ratings. The testimonials are represented
// honestly as VideoObject nodes instead (see testimonialVideoGraph below).
// Removed 2026-05-24 to resolve two Search Console Review-snippet issues:
//   1. "Multiple reviews without aggregateRating object" (critical)
//   2. "nested object can't contain the 'itemReviewed' field" (non-critical)

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
    priceValidUntil: "2026-08-06",
    url: `${SITE}/programs/ekuzo-camps/register`,
  },
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

// ─── Blog Article + author Person ──────────────────────────────────────────
// Karlin already exists as a top-level Person node (coachKarlinSchema) in the
// root @graph. Blog Article authorship references that same @id rather than
// duplicating a second Person — Schema.org graphs prefer one canonical entity.
// `karlinPersonSchema` is exported as a named handle for callers that want to
// pass the author node explicitly.
export const karlinPersonSchema = coachKarlinSchema;

// Google's Rich Results parser flags bare YYYY-MM-DD dates as "invalid
// datetime / missing timezone" (warning). Expand date-only strings to a
// full ISO 8601 datetime at noon UTC (noon avoids date-shift across
// timezones). Already-full datetimes pass through untouched.
function toSchemaDateTime(d: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T12:00:00+00:00` : d;
}

type BlogArticleArgs = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  author?: { "@id": string } | { "@type": "Person"; name: string };
};

export function buildBlogArticleSchema({
  slug,
  title,
  description,
  datePublished,
  dateModified,
  image,
  author,
}: BlogArticleArgs) {
  const url = `${SITE}/blog/${slug}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE}${image}`;
  return {
    "@context": "https://schema.org",
    // BlogPosting is a subtype of Article — same fields, but the more precise
    // type Google + LLMs use to classify authored blog content. Applies to
    // every post built with this helper. @id fragment kept as #article (stable
    // identifier; nothing references it, so no need to churn it).
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    image: imageUrl,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: toSchemaDateTime(datePublished),
    dateModified: toSchemaDateTime(dateModified ?? datePublished),
    author: author ?? { "@id": KARLIN_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

// Convenience wrapper for blog-post breadcrumbs: Home → Blog → [post title].
// Use this on every blog post page so AI/Google can reconstruct site hierarchy.
export function buildBlogPostBreadcrumbSchema(slug: string, title: string) {
  return buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: title, path: `/blog/${slug}` },
  ]);
}

// ─── Author ProfilePage builder ────────────────────────────────────────────
// The Person node already exists in the root @graph (one canonical entity per
// person). The author page emits a ProfilePage that points to that Person by
// @id, plus a breadcrumb. Don't inline a second Person node here — it would
// fork the entity graph.
type AuthorPageArgs = {
  slug: string; // e.g. "karlin-oei"
  name: string; // display name for breadcrumb
  personId: string; // @id of the canonical Person node
  // Optional: inline the Person node into THIS page's @graph. Only needed for
  // an author whose node is not yet in the site-wide `rootGraph` (see
  // personMuhammadHossain). Without it, `mainEntity` would be a dangling @id
  // reference on the one page that most needs to resolve it. Omit for authors
  // already in rootGraph (Karlin, Jamie) so the node isn't emitted twice.
  person?: object;
};

export function buildAuthorPageGraph({
  slug,
  name,
  personId,
  person,
}: AuthorPageArgs) {
  const url = `${SITE}/blog/author/${slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...(person ? [person] : []),
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: `${name} — EKUZO`,
        mainEntity: { "@id": personId },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: name, item: url },
        ],
      },
    ],
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

// ─── VideoObject builder (single embedded video, e.g. a blog reel) ─────────
// For third-party-hosted video (Instagram/YouTube) we emit `embedUrl`, not
// `contentUrl` — we don't host the MP4 and must not fabricate one. Thumbnail
// must be a stable first-party URL (Instagram CDN URLs expire and fail
// validation). Transcript is passed in as an inline string literal (no fs).
type VideoObjectArgs = {
  pageSlug: string;
  name: string;
  description: string;
  thumbnailPath: string; // site-relative, e.g. /images/foo.jpg
  uploadDate: string; // ISO date
  embedUrl: string;
  transcript: string;
};

export function buildVideoObjectSchema({
  pageSlug,
  name,
  description,
  thumbnailPath,
  uploadDate,
  embedUrl,
  transcript,
}: VideoObjectArgs) {
  const pageUrl = `${SITE}/blog/${pageSlug}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${pageUrl}#reel`,
    name,
    description,
    thumbnailUrl: thumbnailPath.startsWith("http")
      ? thumbnailPath
      : `${SITE}${thumbnailPath}`,
    uploadDate: toSchemaDateTime(uploadDate),
    embedUrl,
    author: { "@id": KARLIN_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "en-US",
    transcript,
  };
}

// ─── VideoObject for the League of Legends gameplay clip ───────────────────
// Rendered on the homepage (app/page.tsx, "For players" band). The same clip
// also appears on /programs/ekuzo-camps and /programs/ekuzo101; the canonical
// mainEntityOfPage is the homepage because that is the highest-authority URL
// carrying it. Gameplay footage with no speech, so there is no transcript
// property: `description` carries the crawlable text instead.
export const leagueGameplayVideo = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "@id": `${SITE}/#league-gameplay-video`,
  name: "League of Legends gameplay at EKUZO",
  description:
    "Gameplay from an EKUZO coached session. Students train on League of Legends: five players, defined roles, a shared objective, and a playbook that changes every match. Sessions run in private, EKUZO-moderated servers with a coach on voice, never in public matchmaking.",
  thumbnailUrl: `${SITE}/videos/league-of-legends-camp-poster.jpg`,
  uploadDate: toSchemaDateTime("2026-04-14"),
  duration: "PT22S",
  contentUrl: `${SITE}/videos/league-of-legends-camp.mp4`,
  publisher: { "@id": ORG_ID },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/` },
  inLanguage: "en-US",
  isFamilyFriendly: true,
};

// ─── VideoObject schemas for the 9 testimonial videos ──────────────────────
// Transcripts come from lib/testimonialTranscripts.ts (plain string literals,
// no fs access — see the top-of-file note).
type TestimonialMeta = {
  slug: string;
  name: string;
  role: string;
  transcriptKey: keyof typeof testimonialTranscripts;
  uploadDate: string;
  durationSec: number; // measured with ffprobe; emitted as ISO 8601 duration
};

// Convert whole seconds to an ISO 8601 duration (e.g. 63 -> "PT1M3S").
function secondsToISO8601(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `PT${m ? `${m}M` : ""}${rem}S`;
}

const testimonials: TestimonialMeta[] = [
  { slug: "becky-parent", name: "Becky", role: "Parent", transcriptKey: "beckyParent", uploadDate: "2026-01-12", durationSec: 63 },
  { slug: "brad-parent-girl-gamer", name: "Brad", role: "Parent (girl gamer)", transcriptKey: "bradParentGirlGamer", uploadDate: "2026-01-27", durationSec: 68 },
  { slug: "debbie-potter-monroe", name: "Debbie Potter", role: "Director of Admissions, Robert F. Monroe Day School", transcriptKey: "debbiePotterMonroe", uploadDate: "2026-02-03", durationSec: 50 },
  { slug: "laura-hogan-mirus-academy", name: "Laura Hogan", role: "Administrator, Mirus Academy", transcriptKey: "lauraHoganMirusAcademy", uploadDate: "2026-02-16", durationSec: 76 },
  { slug: "rajitha-parent", name: "Rajitha", role: "Parent", transcriptKey: "rajithaParent", uploadDate: "2026-02-25", durationSec: 48 },
  { slug: "student-i-learned", name: "EKUZO Student", role: "Student", transcriptKey: "studentILearned", uploadDate: "2026-03-04", durationSec: 20 },
  { slug: "student-man-of-my-word", name: "EKUZO Student", role: "Student", transcriptKey: "studentManOfMyWord", uploadDate: "2026-03-12", durationSec: 11 },
  { slug: "student-thank-you-ekuzo", name: "EKUZO Student", role: "Student", transcriptKey: "studentThankYouEkuzo", uploadDate: "2026-03-19", durationSec: 12 },
  { slug: "student-you-should-join", name: "EKUZO Student", role: "Student", transcriptKey: "studentYouShouldJoin", uploadDate: "2026-03-27", durationSec: 13 },
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
    uploadDate: toSchemaDateTime(t.uploadDate),
    duration: secondsToISO8601(t.durationSec),
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

// Single testimonial VideoObject by slug, for embedding one testimonial on a
// content page (e.g. a blog post). Returns the SAME node (same @id) used in
// testimonialVideoGraph so the entity stays canonical across pages.
export function buildTestimonialVideoSchema(slug: string) {
  const node = testimonialVideoNodes.find(
    (n) => n["@id"] === `${SITE}/testimonial-videos/${slug}.mp4#video`,
  );
  if (!node) throw new Error(`Unknown testimonial slug: ${slug}`);
  return { "@context": "https://schema.org", ...node };
}
