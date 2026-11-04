import { Fragment } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import PullQuote from "@/components/blog/PullQuote";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildFAQPageSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

/**
 * The session-end post. Karlin byline. Copy of record:
 * EKUZO/Marketing/content-drafts/_read-copy-get-kid-off-the-game-v6.md
 * (v6, 2026-11-04). Jamie's copy is final: change it only from his copy of
 * record. Build Loop artifacts: docs/session-end-post/.
 *
 * Search job: "how to get my kid off video games without a fight". The H1 is
 * the question a parent asks; the slug and SEO title carry the query.
 */

const SLUG = "how-to-get-your-kid-off-video-games-without-a-fight";
const TITLE_DISPLAY = "How do I get my kid off the game without a fight?";
// Set as an absolute title in `metadata` below, so the layout's
// "%s | EKUZO" template is skipped here.
const TITLE_SEO = "How to get your kid off video games without a fight";
const SUBHEAD =
  "Count matches, not minutes. What to ask before they start, what to say at the end, and what to do when it goes sideways anyway.";
// META: pending Jamie approval
const DESCRIPTION =
  "Count matches, not minutes. How to end a game session without a fight: what to ask before your kid starts, what to say at the end, and what to do if it blows up.";
const HERO_IMAGE =
  "/images/how-to-get-your-kid-off-video-games-without-a-fight-hero.jpg";
const SHARE_IMAGE =
  "/images/how-to-get-your-kid-off-video-games-without-a-fight-card.jpg";
const HERO_ALT =
  "A boy of about 12 on a gray couch at night, headset on and a controller in his hands, watching a screen out of frame in a lamp-lit living room.";
// Re-set both to the ship date if it ships another day.
const DATE_PUBLISHED = "2026-11-04";
const DATE_MODIFIED = "2026-11-04";

const X_POST_URL = "https://x.com/CoachDanGo/status/2099566382681866270";

const KEEP_READING = [
  {
    slug: "should-you-ban-fortnite",
    title: "She banned Fortnite and got her kid back. Then came a new problem.",
    blurb:
      "The ban worked, and it broke something no article warned her about. A military mom’s game-by-game verdicts on Fortnite, Red Dead Redemption, and Minecraft.",
    image: "/images/should-you-ban-fortnite-card.jpg",
    category: "Perspective",
  },
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid’s gaming is telling you",
    blurb:
      "The game is visible. The meaning is hidden. Six signs parents notice first in a gamer kid, and what they often mean.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
  {
    slug: "should-i-buy-my-kid-robux",
    title: "She asked for Robux to learn about money. Her dad said yes.",
    blurb: "For a year the answer was no. At eight, she changed her pitch.",
    image: "/images/should-i-buy-my-kid-robux-card.jpg",
    category: "Perspective",
  },
];

// Visible FAQ + FAQPage JSON-LD from one source. Answers are plain strings
// because the schema only accepts plain text. Copy of record, verbatim.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question:
      "Should I give a five-minute warning before my kid gets off the game?",
    answer:
      "For team games, usually not. Ten minutes into a 45-minute League match, \"five minutes left\" means nothing, because the match can't end in five. Ask how long the match has left, or agree before they start that this is the last one. For games without matches, like Minecraft, a warning to get to a save point works.",
  },
  {
    question: "What if my kid says they can't pause the game?",
    answer:
      "They're probably right. An online team match keeps going without them, the same as a soccer or basketball game. If your kid were on the court, you wouldn't pull them off mid-game. You'd wait for the whistle. Agree to stop at the end of the match, and agree before they start that no new match begins after the number you set.",
  },
  {
    question: "How many matches should I let my kid play?",
    answer:
      "Start with the time you have, then turn it into matches. An hour is one or two League games, two Marvel Rivals matches, or plenty of Smash. Talk it through before they start, so the number is set before the first match.",
  },
  {
    question: "Is it OK to take away video games as a punishment?",
    answer:
      "That's your call. If you do, the AAP suggests enforcing limits \"supportively rather than punitively.\" Before it gets there, lean in. Most of these fights come from the distance between what you expected and what they expected.",
  },
  {
    question: "How do I get my kid off Minecraft or Roblox?",
    answer:
      "Agree on a stopping point the game understands before they start: a save point, the next nightfall in Minecraft, or the end of a round in a Roblox game. Ask \"does this save?\" so stopping doesn't cost their progress. Try to understand what they're building before you judge the screen time, and the stop gets easier to agree on.",
  },
];

const SOURCES: { label: string; url: string; suffix?: string }[] = [
  {
    label:
      "American Academy of Pediatrics (HealthyChildren.org), “Screen Time & Temper Tantrums: Helpful Tips for Parents,” Jenny Radesky, MD, updated March 13, 2024.",
    url: "https://www.healthychildren.org/English/family-life/Media/Pages/Screen-Time-and-Temper-Tantrums-Helpful-Tips-for-Parents.aspx",
  },
  {
    label:
      "AAP Center of Excellence on Social Media and Youth Mental Health, “Setting limitations on tech time,” 2023.",
    url: "https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/setting-limitations-on-tech-time/",
  },
  {
    label:
      "AAP, “How to Make a Family Media Use Plan,” updated January 20, 2026.",
    url: "https://www.healthychildren.org/English/family-life/Media/Pages/How-to-Make-a-Family-Media-Use-Plan.aspx",
  },
  {
    label:
      "Riot Games Support, “Away From Keyboard (AFK) FAQ,” updated June 2026.",
    url: "https://support.riotgames.com/en-us/league-of-legends/penalties/away-from-keyboard-afk-faq",
  },
  {
    label:
      "Riot Games Support, “League of Legends Honor Guide,” updated May 31, 2026.",
    url: "https://support.riotgames.com/en-us/league-of-legends/rewards/league-of-legends-honor-guide",
  },
  {
    label:
      "Alsheail, Gerling and Yildiz (2025), “A Qualitative Exploration of How Children and Parents Experience and Structure Disengagement from Games,” Proc. ACM Hum.-Comput. Interact. 9(6), CHI PLAY. doi 10.1145/3748614.",
    url: "https://doi.org/10.1145/3748614",
  },
  {
    label:
      "Hiniker, Schoenebeck and Kientz (2016), “Not at the Dinner Table,” CSCW 2016 (families with kids 10 to 17), via University of Washington News, March 8, 2016.",
    url: "https://www.washington.edu/news/2016/03/08/family-technology-rules-what-kids-expect-of-parents/",
  },
  {
    label: "Roblox Creator Docs, “Data stores.”",
    url: "https://create.roblox.com/docs/cloud-services/data-stores",
  },
  {
    label: "The parent’s reply on X, in the thread under",
    url: X_POST_URL,
    suffix: "(captured September 2026).",
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
    section: "Parenting",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_SEO,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  robots: { index: true, follow: true },
};

const captionClass =
  "caption-top text-left font-body font-bold text-black pb-3";

export default function PostGetKidOffVideoGames() {
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
              Parenting
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
          <div className="relative w-full" style={{ height: "520px" }}>
            <Image
              src={HERO_IMAGE}
              alt={HERO_ALT}
              fill
              sizes="(max-width: 1264px) 100vw, 1232px"
              className="object-cover"
              priority
            />
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
              <strong>Short answer:</strong>{" "}end at a natural stopping point,
              and agree on where that is before the game starts. Online team
              games can&apos;t be paused. In a game like League of Legends, a
              kid who leaves lets four teammates down and gets penalized by the
              game. So ask what they&apos;re playing and who with, count
              matches instead of minutes, and set the number together. When the
              end is close, walk in and watch the finish with them, then keep
              your words short. If it still blows up, skip the lecture, give
              them somewhere to cool off, and talk it through later when
              everyone&apos;s calm. Most of these fights come from the distance
              between what you expect and what they expect, and a two-minute
              conversation before they start closes most of it.
            </p>

            <h2>Why won&apos;t my kid get off the game when I ask?</h2>
            <p>
              When we ask parents which line they hear most at home,
              &ldquo;five more minutes&rdquo; comes first, with &ldquo;I&apos;m
              almost done&rdquo; and &ldquo;I can&apos;t pause it&rdquo; right
              behind. Replying to{" "}
              <a href={X_POST_URL} target="_blank" rel="noopener noreferrer">
                one of the most-shared posts
              </a>{" "}
              in a recent viral gaming wave, a parent asked the question
              plainly:
            </p>
            <blockquote>
              <p>
                &ldquo;It may but how do you alleviate the attitude your kid
                gets when you make them get off of it&rdquo;
              </p>
              <p>A parent, replying on X</p>
            </blockquote>
            <p>
              I was that kid. Gaming was where I felt most alive and connected.
              I wasn&apos;t just playing, I was with my friends. My mom would
              call me down for dinner or homework in the middle of a match and
              expect me to log off right then. She didn&apos;t see the four
              people on the other side of the screen who were counting on me,
              or that I was practicing something on purpose. It was almost
              always a fight when I was a teenager, and it didn&apos;t let up
              until she understood.
            </p>
            <p>
              Here&apos;s what I wish we&apos;d both known then. Your kid
              usually has a real reason, and each one is worth understanding.
            </p>
            <p>
              <strong>They can&apos;t leave.</strong>{" "}In a team match the game
              keeps going without them, and their team plays a player short. In
              League, Riot&apos;s rules say a game your kid leaves will
              &ldquo;always count as a loss, regardless of whether or not your
              team is victorious,&rdquo; and repeat leaving brings queue delays
              and then lockouts of up to two weeks. A penalty also lowers their
              honor level, which takes away chat, rewards and credibility.
            </p>
            <p>
              <strong>They&apos;re close to a goal.</strong>{" "}&ldquo;I&apos;m
              almost done&rdquo; is often true: a rank, a build, a level.
              Researchers who interviewed children and parents found that kids,
              like adults, &ldquo;struggle to exit play if they have not yet
              reached a point of closure&rdquo; (Alsheail and colleagues,
              2025). This is the good one. Ask what they&apos;re about to
              finish, and you&apos;ll learn what they care about.
            </p>
            <p>
              <strong>They want one more.</strong>{" "}The end of a match is also
              where &ldquo;just one more&rdquo; starts. That&apos;s what the
              plan before they start is for.
            </p>

            <h2>
              How long is a match in Fortnite, League of Legends and other
              games?
            </h2>
            <p>Rough lengths, from playing all of these:</p>
            <table>
              <caption className={captionClass}>
                How long a match lasts, and where to stop
              </caption>
              <thead>
                <tr>
                  <th scope="col">Game</th>
                  <th scope="col">One match</th>
                  <th scope="col">Where to stop</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Fortnite (Battle Royale)</th>
                  <td>
                    About 20 minutes, less if they&apos;re knocked out early
                  </td>
                  <td>When the match ends</td>
                </tr>
                <tr>
                  <th scope="row">League of Legends</th>
                  <td>About 45 minutes, including champion select</td>
                  <td>
                    When the match ends. No new queue after the agreed number
                  </td>
                </tr>
                <tr>
                  <th scope="row">Marvel Rivals</th>
                  <td>About 30 minutes</td>
                  <td>When the match ends</td>
                </tr>
                <tr>
                  <th scope="row">Super Smash Bros.</th>
                  <td>About 5 minutes</td>
                  <td>After any match</td>
                </tr>
                <tr>
                  <th scope="row">Minecraft</th>
                  <td>No match end</td>
                  <td>
                    Agree on a save point, like the next nightfall or the end of
                    a build
                  </td>
                </tr>
                <tr>
                  <th scope="row">Roblox</th>
                  <td>Depends on the game</td>
                  <td>
                    Ask &ldquo;does this save?&rdquo; and pick the stop together
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              Once a team match starts, they&apos;re in until it ends, and the
              game punishes leaving. That makes it a good lesson in planning
              ahead.
            </p>
            <PullQuote>
              Dinner&apos;s in 35 minutes. A League game takes 45. Starting one
              is starting the fight.
            </PullQuote>

            <h2>How do I set a gaming limit my kid will actually follow?</h2>
            <p>
              This checklist won&apos;t fit every house, and a fight
              that&apos;s bigger than a routine needs the right help. For most
              families, it&apos;s the place to start.
            </p>
            <ol>
              <li>
                <strong>
                  Ask about the session the way you&apos;d ask about a practice.
                </strong>{" "}
                &ldquo;Who are you playing with? What game?&rdquo; Once you know
                they&apos;re on a team, a quick check-in replaces yelling across
                the house.
              </li>
              <li>
                <strong>Count matches, not minutes.</strong>{" "}&ldquo;Two more
                matches&rdquo; ends at a moment that makes sense inside the
                game. &ldquo;Thirty more minutes&rdquo; usually ends in the
                middle of one.
              </li>
              <li>
                <strong>Set the number together, at a calm time.</strong>{" "}In a
                University of Washington survey of 249 families with kids 10 to
                17, children found household tech rules easier to follow
                &ldquo;when families had developed them collectively and when
                parents lived by them as well.&rdquo;
              </li>
              <li>
                <strong>Say the plan before they play.</strong>{" "}The American
                Academy of Pediatrics (AAP) puts it this way: &ldquo;Before they
                play, remind your child of the time limit and what their plan is
                for using that time.&rdquo; A plan said at the start is an
                agreement. The same words at the door land as a surprise.
              </li>
              <li>
                <strong>Let the game signal the end.</strong>{" "}If you use a
                timer on the console or computer, set it to alert and skip the
                automatic shut-off, which pulls your kid out mid-match.
              </li>
            </ol>

            <h2>What do I say when it&apos;s time to get off the game?</h2>
            <p>
              Less than you think, and say it from the room. Most games build
              to a big finish, so walk in a few minutes before the match ends
              and watch it with them. The AAP calls sitting near your child and
              &ldquo;quietly observing what they&apos;re doing&rdquo; a way to
              &ldquo;build a bridge back to reality.&rdquo; When the match ends,
              use as few words as possible, as the AAP advises. &ldquo;Good
              game. That&apos;s the last one tonight&rdquo; is plenty.
            </p>

            <h2>What if my kid rages when the game ends?</h2>
            <p>
              Don&apos;t argue the rules in the moment. The AAP puts it simply:
              &ldquo;a child in meltdown mode can&apos;t think logically.&rdquo;
              The conversation can wait until tomorrow.
            </p>
            <p>
              Give them somewhere to go: a quiet spot, or for older kids
              something they like even more, like a quick run or a favorite
              song. In our sessions, kids do pushups and drink water, and both
              are easy to borrow at home.
            </p>
            <p>
              Don&apos;t let the outburst win the game back. If it does, the AAP
              says, the kid &ldquo;will keep doing it.&rdquo;
            </p>
            <p>
              Check the plan once a week. Ask what&apos;s working, and let your
              kid help fix what isn&apos;t.
            </p>

            <h2>Could a gaming coach be the missing piece?</h2>
            <p>
              Sports teams handle the end without thinking about it. Practice
              starts at 4:00 and ends at 5:30, and nobody argues with the clock,
              because the end was set before anyone took the field.
            </p>
            <p>
              A coach does more than keep the clock. Kids call it crashing out:
              one bad moment and their mood takes over the rest of the game. Our
              coaches work with kids on staying grounded through all of it, the
              wins, the losses and the rough stretches in between. That&apos;s
              the same steadiness you&apos;re hoping for when it&apos;s time to
              get off at night.
            </p>
            <p>
              The end of every EKUZO session is on the schedule before anyone
              logs in, and the coach calls it. What happens after is still your
              family&apos;s plan.
            </p>
            <p>
              If the fight at your house is about one game in particular,{" "}
              <Link href="/blog/should-you-ban-fortnite">
                here&apos;s how one family handled Fortnite
              </Link>
              . If you want to know what the hours are giving your kid, read{" "}
              <Link href="/blog/what-your-kids-gaming-is-telling-you">
                what your kid&apos;s gaming is telling you
              </Link>
              . And if you&apos;d rather ask a person,{" "}
              <Link href="/parents">my coaches answer parent questions</Link>.
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
                  {source.suffix ? <> {source.suffix}</> : null}
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
