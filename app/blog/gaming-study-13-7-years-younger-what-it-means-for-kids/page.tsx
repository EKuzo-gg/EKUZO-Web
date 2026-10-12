import { Fragment } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import InstagramEmbed from "@/components/blog/InstagramEmbed";
import ReplyQuoteCards, {
  type ReplyCard,
} from "@/components/blog/ReplyQuoteCards";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildFAQPageSchema,
  buildVideoObjectSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

/**
 * Newsjack answer page for the September 2026 "gamers test 13.7 years
 * younger" wave (Luu post, Sep 13; Elon Musk quotes, Sep 14; 30M+ views by
 * Sep 15). Karlin byline. Every sentence with a number or a study maps to a
 * row in knowledge-base/company/marketing/claims-register-gaming-cognition.md;
 * the brief of record is content-assets-wishlist.md § "The Gaming Study
 * Everyone Shared This Week". Draft and register map:
 * EKUZO/Marketing/content-drafts/2026-09-15-blog-draft-gaming-study-everyone-shared.md
 *
 * Search job: "is gaming good for your brain" (kids-framed) plus the exact
 * phrase "13.7 years younger". The H1 keeps the newsjack; the slug and SEO
 * title carry the query.
 */

const SLUG = "gaming-study-13-7-years-younger-what-it-means-for-kids";
const TITLE_DISPLAY =
  "The gaming study everyone shared, and what it means for your twelve-year-old";
// 61 characters so Google shows it whole. Set as an absolute title in
// `metadata` below, so the layout's "%s | EKUZO" template is skipped here.
const TITLE_SEO =
  "Is gaming good for your brain? The “13.7 years younger” study";
const SUBHEAD =
  "A doctor posted one line about a study. More than 30 million people saw it. I read a thousand of the replies, and the one that mattered wasn’t about the study.";
const DESCRIPTION =
  "A viral post suggested gaming makes you smarter. EKUZO founder Karlin Oei dove in and shares what's real and what's hype.";
const HERO_IMAGE = "/images/gaming-study-13-7-hero.jpg";
const SHARE_IMAGE = "/images/gaming-study-13-7-card.jpg";
const DATE_PUBLISHED = "2026-10-12";
const DATE_MODIFIED = "2026-10-12";

const REANALYSIS_SCRIPT = "/research/gaming-cognition-reanalysis.py";
const REANALYSIS_OUTPUT = "/research/gaming-cognition-reanalysis-output.txt";

// Karlin's June 2026 reel about the entrance essay. Parent consent for the
// blog use is on file (Jamie, 2026-09-15). Spoken audio only, lightly cleaned;
// no fs access (see lib/schema.ts note).
const LOLCAT_REEL_URL = "https://www.instagram.com/p/DZd5t6Ppi6x/";
const LOLCAT_REEL_TRANSCRIPT =
  "When was the last time you got an email that made you cry? For me, it was last week. I got an email from one of our parents who has a teenage gamer, previously known as Kick6767, more recently known as Lolcat. And the summary of the email is that he just graduated from elementary school. He's now going to a private school for sixth grade, and as a part of that introduction he had to write an entrance writing assignment. The writing assignment was: what was your greatest achievement ever? To remind you, this is a kid that does a lot of extracurriculars. He fences, he plays lacrosse, he also plays flag football. But what he decided to write as his greatest achievement ever was actually about playing mid lane in League of Legends. Lolcat has been in our system for about a year now, and for him to write about League of Legends being his greatest achievement ever, and him transitioning to mid lane, has got to be one of the most fulfilling and wholesome moments. It's one of those moments where we are really reminded of why we do what we do, and how special what we do is to kids. Ultimately, oftentimes it is the most important thing to them in life. We're just really grateful, and we're glad that we could be a part of their lives to that extent. And it's a great reminder of the responsibility that we hold as coaches, and our role in their lives in supporting their interests and their passion for video games. So if you're a mom or a dad who loves video games, or maybe even if you don't love video games but your kid does, DM us. We're here to help.";

// Public replies, attributed by handle, likes as shown when read on Sep 14
// and 15, 2026 (Brockie re-read the evening of Sep 15). Never screenshots. Register row 15 (Brockie), 16 (the read),
// 17 (the transition-off question).
const CAMP_CARDS: ReplyCard[] = [
  {
    variant: "blue",
    handle: "@CraigBrockie",
    badge: "Top reply. The author answered “True.”",
    featured: true,
    big: true,
    quote: "The kind of gaming probably matters as much as the hours.",
    likes: "1.1K likes at the time",
  },
  {
    variant: "green",
    handle: "@OxChaino",
    label: "The vindicated",
    quote: "A win for gamers",
  },
  {
    variant: "amber",
    handle: "@ViktorNord",
    label: "The permission seekers",
    quote: "Finally I have a good argument towards my wife.",
    likes: "412 likes at the time",
  },
  {
    variant: "red",
    handle: "@hadesplaybook",
    label: "The “which games” crowd",
    quote:
      "GameCube, Dreamcast and Wii games were built around play itself. Many modern AAA games are built around retention, progression and spending. Both count as gaming, but they may not be doing the same thing to the player.",
  },
];

const PARENT_CARDS: ReplyCard[] = [
  {
    variant: "amber",
    handle: "@TheAccounthnk",
    label: "A parent",
    quote:
      "It may but how do you alleviate the attitude your kid gets when you make them get off of it",
  },
  {
    variant: "red",
    handle: "@bewatchful",
    label: "A parent",
    quote:
      "Kids will quote this study like Scripture. Parents still set the limits.",
  },
];

const KEEP_READING = [
  {
    slug: "what-homeschool-parents-taught-us-about-gaming",
    title: "What 200+ homeschool parents taught us about gaming",
    blurb:
      "We read a 200+ parent thread on kids and gaming. Three camps, the language they use, and the one structured, social, supervised thing they all want.",
    image: "/images/blog-post-6-card.jpg",
    category: "Case Studies",
  },
  {
    slug: "should-you-ban-fortnite",
    title: "She banned Fortnite and got her kid back. Then came a new problem.",
    blurb:
      "The ban worked, and it broke something no article warned her about. A military mom’s game-by-game verdicts on Fortnite, Red Dead Redemption, and Minecraft.",
    image: "/images/should-you-ban-fortnite-card.jpg",
    category: "Perspective",
  },
  {
    slug: "when-your-sons-only-friends-are-online",
    title: "When your son’s only friends are online",
    blurb:
      "Are online gaming friends real? The question isn’t online vs offline. It’s whether he’s alone in a lobby of strangers or on a team with the same people.",
    image: "/images/when-your-sons-only-friends-are-online-hero.jpg",
    category: "Perspective",
  },
];

// Visible FAQ + FAQPage JSON-LD from one source. Answers are plain strings
// because the schema only accepts plain text.
const FAQ_ITEMS: { question: string; answer: string[] }[] = [
  {
    question: "Which games did the study look at?",
    answer: [
      "It grouped games by broad type and had too few action-game players to compare genres, so it can't tell you which games.",
      "“The kind of gaming probably matters as much as the hours” is a reasonable working assumption, and it's how I choose what to coach. That's my design choice, not a finding of this study.",
    ],
  },
  {
    question: "Is gaming good for kids' brains?",
    answer: [
      "This study can't answer that; no one under 18 was in it.",
      "The child studies I know of are cross-sectional and mixed: better scores on some tasks alongside higher attention-problem and depression measures in nine- and ten-year-olds, from a paper that was retracted and replaced in 2023 with the numbers intact and the framing changed. “Associated with,” every time.",
    ],
  },
  {
    question: "How many hours is the right amount?",
    answer: [
      "The paper's threshold for “frequent” was three or more hours a week across any game; the press release used five or more on one game. Neither is a recommendation.",
      "The study compared three groups rather than testing a dose, so it can't tell you what happens above its own threshold. The 2026 review by Nagata and colleagues in Current Pediatrics Reports recommends a family media plan and the AAP's five Cs.",
    ],
  },
  {
    question: "Does the study prove gaming beats exercise?",
    answer: [
      "No. Different associations with different outcomes: gaming with the cognitive scores, exercise with the mood screeners, neither with the other. Cross-sectional, so no direction either way.",
    ],
  },
  {
    question: "How do I get my kid off the game without the attitude?",
    answer: [
      "Set the end before the start, and make the ending part of the activity instead of an interruption to it. Teams and coaches do this for sports without anyone thinking about it.",
      "It's the single most useful thing I've borrowed from sports, and the reason my sessions have a schedule a kid can see.",
    ],
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
        alt: TITLE_DISPLAY,
      },
    ],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Karlin Oei"],
    section: "Perspective",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_SEO,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function PostGamingStudy137() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE_DISPLAY);
  const faqSchema = buildFAQPageSchema(
    FAQ_ITEMS.map((item) => ({
      question: item.question,
      answer: item.answer.join(" "),
    })),
  );
  const videoSchema = buildVideoObjectSchema({
    pageSlug: SLUG,
    name: "Karlin on the email that made him cry: a kid's greatest achievement was mid lane",
    description:
      "EKUZO founder Karlin Oei on a parent's email: a multi-sport kid wrote his sixth-grade entrance essay on playing mid lane in League of Legends.",
    thumbnailPath: SHARE_IMAGE,
    uploadDate: "2026-06-11",
    embedUrl: `${LOLCAT_REEL_URL}embed/`,
    transcript: LOLCAT_REEL_TRANSCRIPT,
  });

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={videoSchema} />

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
              Perspective
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
              alt="A phone showing the X post that says gamers test “~13.7 years younger.” The number is underlined, and a taped note under it reads “not in the paper.” Sticky notes ask which games, how many hours, what age, better than sports. Karlin Oei in a headset."
              fill
              sizes="(max-width: 1040px) 992px, (max-width: 1264px) 100vw, 1232px"
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
            date={DATE_MODIFIED}
            dateLabel="Updated"
          >
            <p>
              <strong>Short answer:</strong>{" "}one study of 923 adults, average
              age 55, found that people who game three or more hours a week
              scored higher than non-gamers on memory, reasoning and
              processing-speed tests. It can&apos;t say the gaming caused that,
              and no one under 18 was in it, so it tells you nothing about your
              twelve-year-old. The &ldquo;13.7 years younger&rdquo; line came
              from a 2024 press release that counted gaming differently. I
              think the better question for a kid is what kind of gaming, and
              who he plays with.
            </p>
            <p>
              I saw{" "}
              <a
                href="https://x.com/BrandonLuuMD/status/2099226796893798645"
                target="_blank"
                rel="noopener noreferrer"
              >
                a recent post on X
              </a>
              , probably the same way you did. A physician with a big following
              put up a study abstract and one sentence: frequent gamers
              performed on cognitive tests like non-gamers about 13.7 years
              younger. Counting the posts that quoted it, it passed 30 million
              views in its first week. For three days my feed argued about
              whether video games make you smart.
            </p>
            <p>
              My first reaction was &ldquo;duh.&rdquo; My second, after I read
              the paper, was that the number everyone was repeating isn&apos;t
              in it. The replies were the interesting part.
            </p>

            <h2>Why &ldquo;duh&rdquo;</h2>
            <p>
              I was an introvert with social anxiety bad enough that my mom
              ordered for me at restaurants. If a stranger talked to me in
              person, I froze. I was not a good student either. Not because I
              couldn&apos;t do the work; I didn&apos;t care about it. My mom
              tried everything to break me out of it: tennis, piano,
              orchestra. Nothing took.
            </p>
            <p>
              The one place I did break out was online. Playing with friends
              and with randoms, people I&apos;d never have said a word to in a
              room, because we had the game in common and both wanted to get
              better at it. I could talk there. I could lead there. No one had
              to ask me to improve.
            </p>
            <p>
              In college I made the UT Dallas team and started playing
              tournaments. A few weeks in, my mom caught me not playing and
              asked why I wasn&apos;t practicing. Like it was the piano. First
              time an adult treated the game as something you could be good at
              on purpose. I practiced. Competing paid for a big chunk of
              college, more than $80,000 in scholarships. That&apos;s not the
              plan for your kid; the scholarships were the receipt. The
              practicing was the point, and she was right. (
              <Link href="/blog/what-your-kids-gaming-is-telling-you">
                I told the longer version of this on camera
              </Link>
              .)
            </p>
            <p>
              So, gamers score higher on memory and reasoning tests: yeah.
              Everything I&apos;m good at, I can trace to a game. But I run a
              company that coaches kids in one, and a study of 55-year-olds
              proves nothing about me or your kid. What I can say is that the
              kid who couldn&apos;t order a sandwich learned to run five
              strangers through a 40-minute match, and the working at it is
              what changed me. One person.
            </p>

            <h2>The reply that mattered</h2>
            <p>
              The most-liked reply under the original post was eleven words,
              and the doctor who posted the study answered &ldquo;True.&rdquo;
            </p>
            <blockquote>
              <p>
                &ldquo;The kind of gaming probably matters as much as the
                hours.&rdquo;
              </p>
              <p>@CraigBrockie, 1.1K likes when I read it on September 15</p>
            </blockquote>
            <p>
              That&apos;s my whole worldview, from a stranger. Every parent
              has the hours conversation. Almost none have the &ldquo;what
              kind&rdquo; conversation, because from the couch all games look
              the same. A kid calling shots for four teammates with a clock
              running is doing something different from a kid tapping cartoon
              fruit on a slot machine. What the game asks of him, and
              who&apos;s around him while it does.
            </p>

            <h2>What a thousand replies said</h2>
            <p>
              I pulled about a thousand replies from the original post and the
              biggest posts that quoted it, nine threads, and read every one. A
              second reader checked a sample and disagreed with me one time in
              five, so call this rough. Four in ten were pro. One in six:
              &ldquo;the study&apos;s fine, but.&rdquo; Under one in ten
              against. The rest: questions, jokes, noise. Three camps, and the
              words they use. (A fourth, the skeptics, said cross-sectional,
              self-reported, read the paper. They were right.)
            </p>
            <p>
              <strong>The vindicated, one in six.</strong>{" "}&ldquo;A win for
              gamers.&rdquo; No one was arguing; they were updating how they
              felt about themselves. That was me at fourteen, with no one to
              say it to.
            </p>
            <p>
              <strong>The permission seekers, one in ten.</strong>{" "}Taking the
              post straight to whoever had been telling them to stop. My mom
              didn&apos;t have a study. She had a kid on a team, and that
              turned out to be enough.
            </p>
            <p>
              <strong>The &ldquo;which games&rdquo; crowd, one in twelve.</strong>{" "}
              StarCraft counts, Candy Crush doesn&apos;t. The study
              couldn&apos;t test that; too few action-game players to compare
              genres. The audience tested it from experience.
            </p>

            <ReplyQuoteCards
              title="Four camps, in their own words"
              subtitle="Public replies to the original post and its biggest quote-posts, read September 14 and 15, 2026."
              cards={CAMP_CARDS}
              footnote="Quotes are public replies on X, attributed by handle, reproduced as posted. Like counts are as shown at the time of reading and have moved since."
            />

            <h2>The parents who didn&apos;t get an answer</h2>
            <p>
              I counted about 120 questions: which games, what age, how many
              hours, is it better than sports. Not one got an answer. The few
              dozen parents talking about their own kids weren&apos;t
              celebrating. They were asking what I hear on every intake call:
            </p>

            <ReplyQuoteCards
              title="The parents in the thread"
              cards={PARENT_CARDS}
            />

            <p>
              Both correct, and neither is about memory tests. My answer to
              the first one is how I run a season, not a promise about what
              comes out. A team that&apos;s expecting you on Tuesday. A coach
              who sets the end of the session before it starts, so getting off
              is part of the plan instead of a fight at the door. Same game
              your kid already plays. Everything around it is different.
            </p>
            <div className="my-10 mx-auto w-full max-w-[560px]">
              <Image
                src="/images/gaming-study-same-game-two-hours.png"
                alt="Same game, two different hours. Who's there: strangers in a public queue, or the same teammates every week. Who's watching: no adult on the call, or a coach on the call. When it ends: when someone says stop, or set before it starts. What it's for: the next win, or one thing to get better at. From the doorway, both look like screen time."
                width={1080}
                height={1350}
                sizes="(max-width: 640px) 100vw, 560px"
                className="w-full h-auto"
              />
            </div>
            <p>
              In June a parent emailed me. Her son, who fences and plays
              lacrosse and flag football, had to write a sixth-grade entrance
              essay on his greatest achievement. He wrote about playing mid
              lane in League of Legends. I won&apos;t tell you what that
              proves. I read it twice.
            </p>

            <InstagramEmbed
              url={LOLCAT_REEL_URL}
              caption="Karlin on the email that made him cry: a multi-sport kid's greatest achievement was mid lane."
            />

            <h2>What the study found, and what it didn&apos;t</h2>
            <p>Not my specialty. My read, checked against the paper.</p>
            <ul>
              <li>
                <strong>True.</strong>{" "}923 adults, average age 55. Gamers at
                three-plus hours a week scored higher on memory, reasoning and
                processing speed; verbal ability, no difference (
                <a
                  href="https://doi.org/10.1371/journal.pone.0334924"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Paleczny et al. 2025
                </a>
                ).
              </li>
              <li>
                <strong>True, and the half no one shared.</strong>{" "}Gaming had
                no association with depression or anxiety. Exercise did, and
                had none with the cognitive scores. That&apos;s the half I
                built around: kids in my sessions do pushups and drink water
                before ranked.
              </li>
              <li>
                <strong>True, and why I take it seriously.</strong>{" "}The senior
                author ran the 2010 Nature study that found brain-training
                games don&apos;t transfer (
                <a
                  href="https://doi.org/10.1038/nature09042"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Owen et al.
                </a>
                ). Hard to convince.
              </li>
              <li>
                <strong>Dubious.</strong>{" "}&ldquo;13.7 years younger.&rdquo;
                It&apos;s from a 2024{" "}
                <a
                  href="https://news.westernu.ca/2024/10/brain-body-study-results/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  press release
                </a>{" "}
                with a different definition of &ldquo;frequent&rdquo;; the
                paper never converts to years. Do the math on the public data
                and it depends on the age you compare to: about 15 years at the
                sample&apos;s average age of 55, about 12 at 70, and over 20 at
                40, where the study runs out of data. (
                <a href={REANALYSIS_SCRIPT}>The script</a> and{" "}
                <a href={REANALYSIS_OUTPUT}>its output</a>, if you want to
                check.)
              </li>
              <li>
                <strong>Needs explanation.</strong>{" "}Cross-sectional and
                self-reported: it can&apos;t say whether gaming builds the
                skill or skilled people game more. Volunteers, mostly
                college-educated. Three of five authors work for Creyos, whose
                tests were used; disclosed, and Canada&apos;s CIHR funded it.
              </li>
              <li>
                <strong>About kids.</strong>{" "}Not in this study. The one big
                study of nine- and ten-year-olds (three-plus hours a day) found
                somewhat better inhibition and working memory alongside higher
                attention-problem and depression scores; it was retracted and
                replaced in 2023, numbers intact, differences &ldquo;very
                small&rdquo; (
                <a
                  href="https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2797596"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chaarani et al.
                </a>
                ;{" "}
                <a
                  href="https://doi.org/10.1001/jamanetworkopen.2023.6895"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  notice
                </a>
                ). Anyone quoting the first half without the second is doing
                the 13.7 thing again.
              </li>
            </ul>

            <h2>Where I stop</h2>
            <p>
              Time in a game displaces something, and this study measured
              neither sleep nor what the gaming replaced. A small share of
              heavy players get into real trouble. Open public queues put your
              kid next to people and language you would not let in your house.
              A post that makes you feel better about the hours is not a
              reason to stop counting them.
            </p>
            <p>
              So: the study is real, the number isn&apos;t the paper&apos;s,
              and a thousand strangers handed a study about hours spent three
              days talking about which game and who&apos;s around him while
              he plays. That&apos;s the conversation worth having at your
              table this week.
            </p>
            <p>
              If your kid&apos;s version of that conversation is the Fortnite
              fight,{" "}
              <Link href="/blog/should-you-ban-fortnite">
                one mom&apos;s account of banning it and what came next
              </Link>{" "}
              is the closest thing I have to a field guide. If it&apos;s the
              &ldquo;which game&rdquo; question,{" "}
              <Link href="/blog/league-of-legends-youth-development">
                here&apos;s why I coach League
              </Link>
              . And if you&apos;d rather ask a person,{" "}
              <Link href="/parents">my coaches answer parent questions</Link>.
            </p>

            <h2>Common questions</h2>
            {FAQ_ITEMS.map((item) => (
              <Fragment key={item.question}>
                <h3>{item.question}</h3>
                {item.answer.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </Fragment>
            ))}

            <h2>Sources</h2>
            <ul>
              <li>
                Paleczny, Wild, Xue, Highfield and Owen (2025), PLOS ONE
                20(10): e0334924.{" "}
                <a
                  href="https://doi.org/10.1371/journal.pone.0334924"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  doi 10.1371/journal.pone.0334924
                </a>
                . Public dataset (CC0):{" "}
                <a
                  href="https://doi.org/10.5683/SP3/WUYAGU"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  doi 10.5683/SP3/WUYAGU
                </a>
                . Reanalysis: <a href={REANALYSIS_SCRIPT}>script</a>,{" "}
                <a href={REANALYSIS_OUTPUT}>output</a>.
              </li>
              <li>
                Western University press release, October 17, 2024.{" "}
                <a
                  href="https://news.westernu.ca/2024/10/brain-body-study-results/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  news.westernu.ca
                </a>
                .
              </li>
              <li>
                Owen et al. (2010), &ldquo;Putting brain training to the
                test,&rdquo; Nature 465:775.{" "}
                <a
                  href="https://doi.org/10.1038/nature09042"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  doi 10.1038/nature09042
                </a>
                .
              </li>
              <li>
                Chaarani et al. (2022, retracted and replaced 2023), JAMA
                Network Open.{" "}
                <a
                  href="https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2797596"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Replacement article
                </a>
                ;{" "}
                <a
                  href="https://doi.org/10.1001/jamanetworkopen.2023.6895"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  notice of retraction and replacement
                </a>
                .
              </li>
              <li>
                Nagata et al. (2026), Current Pediatrics Reports 14(1):2, the
                review recommending a family media plan and the AAP&apos;s
                five Cs.
              </li>
              <li>
                The original post and replies: Brandon Luu MD, September 13,
                2026,{" "}
                <a
                  href="https://x.com/BrandonLuuMD/status/2099226796893798645"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  x.com
                </a>
                . Reply counts and sentiment are from a read of about 1,000
                replies across nine threads on September 14 and 15, 2026; a
                blind second pass agreed with the stance labels 81% of the
                time. View counts: more than 30M across the original post and
                its quote-posts by September 15, 2026. Original post 17.2M as
                read October 11, 2026; the two largest quote-posts 5.8M and
                7.9M, and about 33M across eight posts, as read October 6,
                2026. Likes as shown at the time.
              </li>
            </ul>

            <p className="text-right">Karlin, founder of EKUZO</p>
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
