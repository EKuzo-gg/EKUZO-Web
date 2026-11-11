import { Fragment } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import GutCheckAside from "@/components/blog/GutCheckAside";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildFAQPageSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image, { getImageProps } from "next/image";

/**
 * "My kid doesn't like sports. What now?" Karlin byline. Copy of record:
 * docs/sports-post/02-copy-deck.md (approved by Jamie 2026-11-11). Change the
 * copy only from that file. Build Loop artifacts: docs/sports-post/.
 *
 * Search job: "my kid doesn't like sports". The H1 is the question a parent
 * asks. No VideoObject schema: lib/schema.ts has no builder for a YouTube
 * embed of EKUZO's own video, and the Build Loop spec says to skip it then.
 */

const SLUG = "my-kid-doesnt-like-sports";
const TITLE_DISPLAY = "My kid doesn't like sports. What now?";
// Set as an absolute title in `metadata` below, so the layout's
// "%s | EKUZO" template is skipped here.
const TITLE_SEO = "My kid doesn't like sports. What now?";
const SUBHEAD = "What a team gives a kid, and where to look for one.";
const DESCRIPTION =
  "Fewer than half of kids play a team sport regularly. What a team gives a kid, where else to find it, and how to start with what your kid already loves.";
const HERO_IMAGE = "/images/my-kid-doesnt-like-sports-hero.jpg";
const SHARE_IMAGE = "/images/my-kid-doesnt-like-sports-card.jpg";
const HERO_IMAGE_MOBILE = "/images/my-kid-doesnt-like-sports-hero-mobile.jpg";
const HERO_ALT =
  "Karlin Oei as a teenager in a white concert shirt, beside a photo of his college esports team with their hands together before a match.";
const VIDEO_ID = "RVkSj6AYCDs";
// Karlin telling the Inception story (UT interview clip B01), added 2026-11-11.
const STORY_VIDEO_ID = "xSWJuBNC62c";
const DATE_PUBLISHED = "2026-11-11";
const DATE_MODIFIED = "2026-11-11";

const KEEP_READING = [
  {
    slug: "when-your-sons-only-friends-are-online",
    title: "When your son's only friends are online",
    blurb:
      "Are online gaming friends real? The question isn't online vs offline. It's whether he's alone in a lobby of strangers or on a team with the same people.",
    image: "/images/when-your-sons-only-friends-are-online-hero.jpg",
    category: "Perspective",
  },
  {
    slug: "how-to-get-your-kid-off-video-games-without-a-fight",
    title: "How do I get my kid off the game without a fight?",
    blurb:
      "End at a natural stopping point, and agree on where that is before the game starts.",
    image:
      "/images/how-to-get-your-kid-off-video-games-without-a-fight-card-clean.jpg",
    category: "Guides",
  },
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid’s gaming is telling you",
    blurb:
      "The game is visible. The meaning is hidden. Six signs parents notice first in a gamer kid, and what they often mean.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
];

// Visible FAQ + FAQPage JSON-LD from one source. Answers are plain strings
// because the schema only accepts plain text. Copy of record, verbatim.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "My son doesn't like sports. Is that a problem?",
    answer:
      "No. Most boys don't play a team sport regularly, and that's been true for years. Look for a team built around something he does care about.",
  },
  {
    question: "What if my daughter doesn't like sports?",
    answer:
      "Same answer. Most girls don't play a team sport regularly either, so she has company too. Look for the same four things: the same people every week, a coach, a season and a role.",
  },
  {
    question: "Should I make my kid play a sport?",
    answer:
      "That's your call, and plenty of families have a \"one activity a season\" rule. If you have one, let your kid choose the activity.",
  },
  {
    question: "What activities are good for a kid who isn't athletic?",
    answer:
      "Start with what they already love. A kid who draws might like stage crew. A kid who takes things apart might like robotics. A kid who plays video games every day might like a coached team.",
  },
  {
    question:
      "My kid only wants to play video games. Does that count as an activity?",
    answer:
      "Playing alone in a bedroom is a hobby. The same game on a team, with a coach, a schedule and a season, is an activity.",
  },
];

const SOURCES: { label: string; url: string }[] = [
  {
    label:
      "Aspen Institute Project Play, “State of Play 2025: Participation Trends” (SFIA data, ages 6 to 17, 2024).",
    url: "https://projectplay.org/state-of-play-2025/participation-trends",
  },
  {
    label:
      "Daniel Brown, “With League of Legends world finals approaching, more colleges are welcoming esports,” The Athletic, November 17, 2023.",
    url: "https://www.nytimes.com/athletic/5069385/2023/11/17/esports-league-of-legends-college-gaming/",
  },
];

export const metadata = {
  alternates: { canonical: `/blog/${SLUG}` },
  title: { absolute: TITLE_SEO },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE_SEO,
    description: DESCRIPTION,
    type: "article",
    url: `https://ekuzo.gg/blog/${SLUG}`,
    siteName: "EKUZO",
    locale: "en_US",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: HERO_ALT,
      },
    ],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Karlin Oei"],
    section: "Guides",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_SEO,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function PostMyKidDoesntLikeSports() {
  const { props: heroDesktop } = getImageProps({
    src: HERO_IMAGE,
    alt: HERO_ALT,
    width: 2464,
    height: 1040,
    sizes: "(max-width: 1264px) 100vw, 1232px",
  });
  const { props: heroMobile } = getImageProps({
    src: HERO_IMAGE_MOBILE,
    alt: HERO_ALT,
    width: 1080,
    height: 900,
    sizes: "100vw",
  });

  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE_DISPLAY);
  const faqSchema = buildFAQPageSchema(FAQ_ITEMS);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      <article className="bg-white relative overflow-hidden">
        {/* Decorative top-right brush */}
        <div
          className="absolute top-0 right-0 w-[400px] pointer-events-none"
          aria-hidden="true"
        >
          <Image
            src="/images/blog-slug-right-deco.png"
            alt=""
            width={400}
            height={500}
            className="opacity-70"
          />
        </div>

        {/* ══ HEADER ════════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto relative"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            paddingTop: "188px",
            paddingBottom: "60px",
          }}
        >
          <div className="max-w-[820px]">
            <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase mb-4 block">
              Guides
            </span>
            <h1
              className="font-body font-bold text-black leading-tight mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              {TITLE_DISPLAY}
            </h1>
            <p
              className="font-body text-black/60 italic leading-snug"
              style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.375rem)" }}
            >
              {SUBHEAD}
            </p>
          </div>
        </div>

        {/* ══ HERO IMAGE ════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto mb-20"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Page-local: the hero is three panels with text and captions baked in, so it keeps
              its natural 1232:520 ratio at every width and nothing is cropped. */}
          {/* Art direction: below md the three panels are too small to read, so phones get a
              stacked version (quote on top, the two photos beneath). One <picture>, one request. */}
          <div className="relative w-full aspect-[1080/900] md:aspect-[1232/520]">
            <picture>
              <source media="(min-width: 768px)" srcSet={heroDesktop.srcSet} sizes={heroDesktop.sizes} />
              <source srcSet={heroMobile.srcSet} sizes={heroMobile.sizes} />
              <img
                src={heroMobile.src}
                alt={HERO_ALT}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </picture>
          </div>
        </div>

        {/* ══ BODY ══════════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto pb-32"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <BlogPostBody
            author="karlin-oei"
            published={DATE_PUBLISHED}
            modified={DATE_MODIFIED}
          >
            <p>
              <strong>Short answer:</strong>{" "}nothing is wrong with your kid.
              Fewer than half of kids play a team sport on a regular basis.
              What&apos;s worth replacing is what a good team gives them: the
              same people every week, a coach who knows them, a season that
              builds to something, and a job other kids count on them to do.
              Before you sign them up for the next thing, look at what they
              already love, and find a team built around that. For a lot of
              kids, that&apos;s video games.
            </p>

            <h2>Is something wrong if my son or daughter doesn&apos;t like sports?</h2>
            <p>
              No. In the Aspen Institute&apos;s{" "}
              <a
                href="https://projectplay.org/state-of-play-2025/participation-trends"
                target="_blank"
                rel="noopener noreferrer"
              >
                State of Play 2025
              </a>{" "}
              report, no more than 42% of boys ages 6 to 17 have played a team
              sport regularly in any of the last nine years. For girls,
              the high was 37%. Your kid has plenty of company.
            </p>
            <p>
              So the worry is usually about something else. An educator said it
              well in{" "}
              <a
                href="https://www.youtube.com/watch?v=Pyicgs8RXnc&t=90s"
                target="_blank"
                rel="noopener noreferrer"
              >
                a video we made about our program
              </a>
              :
            </p>
            <blockquote>
              <p>
                &ldquo;It&apos;s really important to be in an environment where
                you&apos;re working on a team, you&apos;re seeing what
                you&apos;re made of... and so if your kid&apos;s not into
                sports, how are they going to get that?&rdquo;
              </p>
            </blockquote>
            <p>I was that kid. Here&apos;s how it went for me.</p>

            <h2>I was the kid who didn&apos;t like sports</h2>
            <p>
              I grew up in Sugar Land, Texas, in a family of doctors. School ran
              from 7 to 3. After that came piano, cello, swim team and whatever
              else was on the calendar until 8, then homework, then bed. In high
              school I was on the tennis team. It was not good.
            </p>
            <p>
              None of it took. I wasn&apos;t into sports and I wasn&apos;t into
              fine arts. I had a lot of social anxiety, and I didn&apos;t feel
              connected to much of anything.
            </p>
            <p>
              The one thing I loved was the thing my parents liked least. When I
              was 15, my older brother and four of his friends would come over
              after school and play League of Legends in our living room, all on
              one team, laughing and yelling. I wanted to feel that.
            </p>
            <p>
              I didn&apos;t get it until college, when I joined the League of
              Legends team at UT Dallas. We had team dinners. I learned who at
              home was rooting for each of my teammates. When we won our region,
              my mom called on video and showed me the room: my family, watching
              our match on the big TV.
            </p>
            <p>
              Later that spring I was home on the couch, rewatching
              &quot;Inception,&quot; when my mom slapped me on the back of the
              head and asked why I was watching a silly movie when I should be
              practicing. I went to my room, queued up a game and cried. For the
              first time, I felt like my mom saw me.{" "}
              <a
                href="https://www.nytimes.com/athletic/5069385/2023/11/17/esports-league-of-legends-college-gaming/"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Athletic opened a story with that moment
              </a>{" "}
              in 2023.
            </p>
            <div className="my-8 mx-auto w-full max-w-[640px]">
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${STORY_VIDEO_ID}`}
                  title="Karlin Oei: My mom just saw me for the first time"
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>
            <p>
              I was 21. I started EKUZO so a kid could have that at 9, with a
              coach.
            </p>

            <h2>What should I look at before I sign my kid up for the next thing?</h2>
            {/* Placement rule: directly after the H2 (no clear on .blog-content h2). */}
            <GutCheckAside
              title="Try this tonight"
              subtitle="Three things to do before the next sign-up"
              questions={[
                "Ask what they liked about the last team or class, and what they didn't.",
                "Ask what team they'd join if they could pick anything.",
                "Watch one game with them and count who they're playing with.",
              ]}
            />
            <p>
              Everything my parents signed me up for was a fair guess. The thing
              I loved was in our living room the whole time.
            </p>
            <p>
              So before the next sign-up, watch for a week. What does your kid
              do when no one is making them? What do they talk about until you
              stop following? Who are they with when they do it?
            </p>
            <p>
              For some kids that&apos;s drawing, taking things apart or the
              drums. Then stage crew, robotics or band could be their team. For
              a lot of kids it&apos;s a video game. You may not love what you
              find. My parents didn&apos;t. Start there anyway.
            </p>
            <h2>What does a team give a kid?</h2>
            <p>Once you know what they love, look for four things around it.</p>
            <ol>
              <li>
                <strong>The same people every week.</strong>{" "}That&apos;s how
                kids make real friends.
              </li>
              <li>
                <strong>A coach.</strong>{" "}An adult who knows your kid and
                tells them the truth kindly.
              </li>
              <li>
                <strong>A season that builds to something.</strong>{" "}Opening
                night, a concert, a tournament. A date on the calendar gives
                practice a point.
              </li>
              <li>
                <strong>A job other kids count on.</strong>{" "}I learned you can
                only build something special with a team.
              </li>
            </ol>

            <h2>Could a video game team be your kid&apos;s team?</h2>
            <p>
              If your kid plays every day and has never clicked with a sport,
              it&apos;s worth a look. A parent in{" "}
              <a
                href="https://www.youtube.com/watch?v=RVkSj6AYCDs"
                target="_blank"
                rel="noopener noreferrer"
              >
                another of our videos
              </a>{" "}
              described it this way:
            </p>
            <blockquote>
              <p>
                &ldquo;We&apos;re not a super athletic family, so we
                don&apos;t have baseball or soccer or those sorts of things to
                go to, but EKUZO in a huge way sort of fills that same sort of
                role.&rdquo;
              </p>
            </blockquote>
            <div className="my-8 mx-auto w-full max-w-[640px]">
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_ID}`}
                  title="Not Into Traditional Sports? That's Okay."
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>
            <p>
              Colleges came around to it while I was still playing. After our
              season, the athletics director at UT Dallas emailed me. The school
              made us varsity athletes, with jerseys, trainers and scholarships.
              The game stayed the same. The adults around it changed.
            </p>
            <p>
              <Link href="/season1/join">Season 01, our coached team season</Link>
              , puts kids 9 and older on teams of five with the same coach and
              the same teammates all season. They practice online twice a week,
              and the season builds to a tournament in the spring. They play
              League of Legends, and most kids start from scratch.
            </p>
            <p>
              A gaming team doesn&apos;t replace moving. We teach our players
              that the body and the mind are connected: to play your best, you
              have to be at your best. So our practices include pushups and
              water, and kids still need to get outside.
            </p>
            <p>
              If your kid&apos;s friends are mostly online, read{" "}
              <Link href="/blog/when-your-sons-only-friends-are-online">
                when your son&apos;s only friends are online
              </Link>
              . If logging off is the nightly fight, here&apos;s{" "}
              <Link href="/blog/how-to-get-your-kid-off-video-games-without-a-fight">
                how to get your kid off the game without one
              </Link>
              .
            </p>

            <h2>Common questions</h2>
            {FAQ_ITEMS.map((item) => (
              <Fragment key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </Fragment>
            ))}

            <h2>Sources</h2>
            <ul>
              {SOURCES.map((source) => (
                <li key={source.url}>
                  {source.label}{" "}
                  {/* Long bare URLs wrap instead of clipping at phone width (Sentry D2). */}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="[overflow-wrap:anywhere]"
                  >
                    {source.url}
                  </a>
                </li>
              ))}
            </ul>
          </BlogPostBody>
        </div>
      </article>

      {/* ══ KEEP READING ══════════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section
          className="bg-[#f0edea] relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 10vw, 144px)",
            paddingBottom: "clamp(80px, 10vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-8">
              Keep Reading
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0 m-0">
              {KEEP_READING.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-black">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                    <div className="pt-5 flex flex-col gap-2">
                      <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase">
                        {post.category}
                      </span>
                      <h3 className="font-body font-bold text-black text-lg leading-snug group-hover:text-red transition-colors">
                        {post.title}
                      </h3>
                      <p className="font-body text-black/50 text-sm leading-relaxed">
                        {post.blurb}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <FooterBanner heading="Every gamer deserves a team" />
      <Footer />
    </>
  );
}
