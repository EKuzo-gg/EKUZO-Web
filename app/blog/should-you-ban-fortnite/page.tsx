import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import WireframePlaceholder from "@/components/blog/WireframePlaceholder";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

/*
 * ── Kassi post (parent piece / ban arc): read before editing ─────────────────
 * BUILT 2026-07-28 from the blessed FINAL v2.2 (knowledge-base
 * outputs/2026-07-27-parent-piece-should-you-ban-fortnite-FINAL-v2.md —
 * Jamie reviewed 2026-07-28, two edits applied there; the md is the prose
 * source of truth until publish).
 * DIFFERENTIATION: this piece OWNS the ban arc and the research stack:
 * the Fort-Hole coinage story, FTC/Epic, Red Dead, Minecraft, Coyne,
 * Columbia, and the full orchestra-sectionals story. The sibling piece
 * (/blog/gaming-military-families) owns moves/community-that-travels, chair
 * flying, military esports programs, Haidt, her bar for organized gaming
 * (incl. the "value... controlled" line is quoted HERE, paraphrased there).
 * Shared narrator strings across the bundle are limited to the two spine
 * quotes ("had its purpose," "is back") and the locked consent boilerplate.
 * Contamination-grep both pieces before adding prose to either.
 * Voice: Muhammad's (21, plain, earnest, dry). knowledge-base
 * system/methodology/voice-dna.md is law: no em dashes in prose, no banned
 * vocab/phrases, sentence-case headers. Never an editorial "we".
 * FRAMING (Jamie): a HUMAN story. Kassi is the protagonist; Muhammad is the
 * witness. EKUZO presence capped at the smile-beat level (the one EKUZO 101
 * sentence in the Minecraft section is the single product link).
 * ASK-FORGIVENESS DISCIPLINE: Kassi does not know this was written. Every
 * claim about the conversation must match the tape, including order: the
 * casino exchange runs HIS comparison [16:47] then HER ethics line [16:54];
 * her "should be put in prison" [16:37] came before his casino line, so she
 * was already past angry ("went somewhere past agreeing" is the accurate
 * phrasing, checked 2026-07-27). No conversation-order claims beyond these.
 * Ship state: LIVE BUT UNDISSEMINATED pending Kassi's blessing (email offers
 * changes). robots is index:false and the post is NOT in sitemap.ts until she
 * blesses it. TO PUBLISH: flip robots to index:true here, add the sitemap
 * entry, uncomment the /blog listing entry, delete this slug's AI-crawler
 * lines in public/robots.txt, and drop the X-Robots-Tag rule in
 * next.config.mjs (both pieces flip together on her blessing).
 * ALSO AT THE FLIP (added 2026-07-28, when the author layer shipped): run the
 * TO PUBLISH checklist in app/blog/author/muhammad-hossain/page.tsx. That page
 * is dark for the same reason and flips at the same moment as both posts.
 * Quote discipline: every verbatim is auto-caption text with inferred
 * attribution — VERIFY each against https://youtu.be/MTS3fODxHLk before
 * dissemination (markers inline below; ★ = added to Muhammad's verify list
 * 2026-07-27, the extended casino verbatim).
 * Anonymization: son's name replaced with "[my son]" on purpose (stays even
 * after blessing unless Kassi asks for it back). Identifying sentences carry
 * "ID variant" comments with details-changed replacements.
 * No FooterBanner on this page by design (non-promotional piece).
 * The one-link rule governs PRODUCT links only: exactly one, to EKUZO 101
 * (inside the Minecraft section). The listening-project calendar CTA is the
 * piece's final beat — it is not a product link.
 * Hero/card art direction: TBD WITH JAMIE (non-military; do not reuse the
 * sibling's split composition). Placeholder notes below are PROVISIONAL.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SLUG = "should-you-ban-fortnite";
const TITLE_DISPLAY =
  "She banned Fortnite and got her kid back. Then came a new problem.";
// Meta <title> carries the search question ("should you ban Fortnite");
// OG/Twitter cards carry the emotional H1 for shares (sibling pattern).
const TITLE_META = "Should you ban Fortnite? What happened when one mom did";
// Subhead + description are page furniture written at build, not part of the
// blessed md prose — tweak freely.
const SUBHEAD =
  "She's a military mom who banned Fortnite. The ban worked. Then her family found out what else the game had been doing.";
const DESCRIPTION =
  "The ban worked, and it broke something no article warned her about. A military mom's game-by-game verdicts on Fortnite, Red Dead Redemption, and Minecraft, as told to a 21-year-old esports coach.";
const SHARE_IMAGE = "/images/should-you-ban-fortnite-hero.jpg"; // asset pending — art direction TBD with Jamie
const DATE_PUBLISHED = "2026-07-28";
const DATE_MODIFIED = "2026-07-28";
// Listening-project CTA (final beat of the post). Not a product link.
const LISTENING_CALENDAR = "https://calendar.app.google/mMJ5KoxcNdH6SR13A";

// Every claim in the post that carries a number or an institutional fact.
// Each one also resolves to an entry in knowledge-base ekuzo-fact-library.md.
const SOURCES: { text: string; cite: string; url: string }[] = [
  {
    text: "Federal Trade Commission, ",
    cite: "Fortnite Video Game Maker Epic Games to Pay More Than Half a Billion Dollars over FTC Allegations of Privacy Violations and Unwanted Charges (December 2022).",
    url: "https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations",
  },
  {
    text: "Coyne et al., ",
    cite: "Super Mario brothers and sisters: Associations between coplaying video games and sibling conflict and affection, Computers in Human Behavior (2016).",
    url: "https://www.sciencedirect.com/science/article/abs/pii/S014019711500281X",
  },
  {
    text: "Columbia University Irving Medical Center, ",
    cite: "Addictive use of social media, not total time, associated with youth mental health (2025).",
    url: "https://www.cuimc.columbia.edu/news/addictive-use-social-media-not-total-time-associated-youth-mental-health",
  },
];

const KEEP_READING = [
  {
    slug: "gaming-military-families",
    title:
      "Every move wiped their friend map. Gaming was the community that traveled.",
    blurb:
      "The other half of Kassi's story: the moves, chair flying, and the communities that travel.",
    image: "/images/gaming-military-families-card.jpg", // asset pending (sibling card)
    category: "Perspective",
  },
  {
    slug: "when-your-sons-only-friends-are-online",
    title: "When your son’s only friends are online",
    blurb: "Are online friends real? The shape of play matters more than the hours.",
    image: "/images/when-your-sons-only-friends-are-online-hero.jpg",
    category: "Perspective",
  },
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid’s gaming is telling you",
    blurb: "The six quiet signals underneath the hours.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
];

export const metadata = {
  alternates: { canonical: `/blog/${SLUG}` },
  title: TITLE_META,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    type: "article",
    url: `https://ekuzo.gg/blog/${SLUG}`,
    siteName: "EKUZO",
    locale: "en_US",
    images: [{ url: SHARE_IMAGE, width: 1920, height: 1080, alt: TITLE_DISPLAY }],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Muhammad Hossain"],
    section: "Perspective",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  // Undisseminated ship state: keep out of search until Kassi blesses the
  // bundle, then flip index to true and add the sitemap entry.
  robots: { index: false, follow: true },
};

export default function PostShouldYouBanFortnite() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
    author: { "@type": "Person", name: "Muhammad Hossain" },
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE_DISPLAY);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

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

        {/* ══ HERO (asset pending — art direction TBD with Jamie) ══════════ */}
        <div
          className="max-w-[1232px] mx-auto mb-20"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <WireframePlaceholder
            type="image"
            label="Hero: the house after the ban"
            note="ART DIRECTION TBD WITH JAMIE — placeholder brief, non-military by design (that's the sibling's lane). Provisional idea: a living-room scene, two controllers on a couch, one dark TV; or a kitchen-table scene, a parent's-eye view. No faces, no photos of Kassi or her kids, nothing Fortnite-trademarked. 1920x1080; must crop cleanly to 1200x630 for OG. Save as /images/should-you-ban-fortnite-hero.jpg. Companion card: /images/should-you-ban-fortnite-card.jpg (16:10). Design brief to Aaron AFTER Jamie sets direction."
            height={520}
          />
        </div>

        {/* ══ BODY ══════════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto pb-32"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <BlogPostBody author="muhammad-hossain" date={DATE_PUBLISHED}>
              <p>
                Howdy, I’m Muhammad. I’m a rising senior at Texas A&amp;M, and I
                coach kids in League of Legends for a youth esports startup
                called EKUZO. This summer, part of my job is listening. I
                interview parents about gaming and screens, and I write down
                what actually happens in their houses, because it’s usually
                more useful than what the internet argues about.
              </p>
              <p>
                I’d like to tell you about Kassi. She’s a mom of two boys who
                banned Fortnite from her house. The short version, in case
                you’re standing in your kitchen right now trying to decide
                whether to ban the game yourself: the ban worked. The kid she’d
                been missing came back. But then a new problem showed up, one
                none of the articles had warned her about, because the game had
                been quietly doing a job in her family, and banning it left the
                job open.
              </p>
              <p>
                What she did next is the useful part. She didn’t quit games.
                She started judging them one at a time, by the kid each one
                handed back to her.
              </p>

              <h2>Why she banned Fortnite</h2>
              {/* VERIFY vs video before dissemination — [06:02] (her coinage,
                  incl. the self-censored trail-off) and [06:17]→[06:20] (his
                  reaction: "Nope. That's a great term." / "It's a great term.
                  I take that for myself." — the narration paraphrases his own
                  tape words, in-domain). */}
              <p>
                She has a name for what the game did to her house. “Fort-Hole
                is what I coined the term,” she told me, “for teenagers who
                play Fortnite and turn into...” and she stopped herself. She
                didn’t need to finish it. I told her it was a great term and
                that I was taking it for myself. If you have a teenager and a
                copy of Fortnite, you’ve met a Fort-Hole: one more loss on a
                laggy night and there’s somebody in your living room you don’t
                recognize, yelling at the wifi.
              </p>
              {/* VERIFY vs video before dissemination — [06:20] ("Fortnite,
                  even though I think it's the devil, had its purpose" — one of
                  the two shared spine quotes across the bundle, on purpose).
                  ID variant: "She's a military officer, and the job moved her
                  family constantly. One of those moves landed her boys far
                  from everyone they knew right as COVID locked everything
                  down." (drops pilot + overseas) */}
              <p>
                It didn’t start that way. She’s a military pilot, and the job
                moved her family constantly. One of those moves landed her boys
                overseas right as COVID locked everything down. An ocean away
                from everyone they knew, her sons found their people in
                Fortnite. She let them have it, and her verdict on that season
                is the most honest sentence about gaming I’ve heard from a
                parent: “Fortnite, even though I think it’s the devil, had its
                purpose.”
              </p>
              {/* VERIFY vs video before dissemination — [15:53]. Caption reads
                  "I would ground him FOR Fortnite"; the piece prints "from" —
                  confirm which word is on the video (likely ASR; same cleanup
                  class as the sibling's "because of the strategy" note).
                  "Oh, [my son] is back" is the second shared spine quote; the
                  bracketed name substitution is deliberate and stays even
                  after blessing unless Kassi asks for the name back. */}
              <p>
                Then the purpose ran out. “I knew my kid acted horribly when he
                would spend so many hours on Fortnite,” she told me. “I would
                ground him from Fortnite and then everything he did was to get
                back on Fortnite.” The punishment had become part of the loop.
                So the family banned it outright, and her memory of what
                happened next is one short line of relief: “Oh, [my son] is
                back.”
              </p>
              {/* FACT: FTC/Epic $520M (Dec 2022) — fact library. */}
              {/* VERIFY vs video before dissemination — TAPE ORDER PRESERVED:
                  his casino comparison [16:47] precedes her ethics line
                  [16:54]; her "should be put in prison" [16:37] came BEFORE
                  his casino line (she was already past angry, hence "went
                  somewhere past agreeing" — phrasing checked vs tape 7/27).
                  ★ = the extended verbatim on Muhammad's verify list; caption
                  reads "It's and they did it intentionally and they hired
                  them intentionally. Like where is the ethics of it? There
                  isn't any." — the printed quote compresses with an ellipsis,
                  confirm on video. */}
              <p>
                The research came after the ban, not before. She read about how
                the game’s design targets dopamine responses in kids. I told
                her I’d always thought those mechanics looked like a casino
                floor, and she went somewhere past agreeing: “They did it
                intentionally... Where is the ethics of it? There isn’t any.”
                The record backs her instinct. In 2022 the FTC ordered Epic
                Games, Fortnite’s maker, to{" "}
                <a
                  href="https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  pay $520 million
                </a>{" "}
                over children’s privacy violations and design tricks that
                pushed players into unwanted purchases, the largest penalty of
                its kind at the time.
              </p>

              <h2>What the ban fixed, and what it broke</h2>
              <p>
                The ban fixed the behavior. Her son stopped orbiting the game,
                and the kid underneath came back out.
              </p>
              {/* One's a band kid [07:27] — her words; the brothers-overlap
                  framing is the piece's thesis beat. */}
              <p>
                Here’s the new problem. Her boys are different people. One’s a
                band kid, one isn’t, and they didn’t have much in common. The
                game she’d just removed had been one of the few places they
                overlapped. A ban takes away everything a game was doing, and
                Fortnite had been doing two jobs in her house: hijacking one
                son’s wiring, and giving two brothers a place to be brothers.
              </p>
              {/* VERIFY vs video before dissemination — [06:56] ("a little bit
                  out of boredom once Fortnite was banned from my home"). */}
              <p>
                She saw the gap herself. When I asked why her boys play what
                they play now, part of her answer was honest to the bone: “a
                little bit out of boredom once Fortnite was banned from my
                home.”
              </p>
              {/* VERIFY vs video before dissemination — [18:39] ("I just know
                  Fortnite for me is a devil and creates little four holes" —
                  caption spells the coinage phonetically; the piece normalizes
                  to "Fort-Holes," confirm on video). */}
              <p>
                Nobody warns you about that part. The screen-time argument
                treats games as interchangeable, one gray mass of hours to be
                capped. Her experience says the opposite. In her words: some
                games are manipulative, and “Fortnite for me is a devil and
                creates little Fort-Holes.” Others were quietly holding her
                family together. Each game was doing something specific for her
                kids, and the only way she found out was by removing one and
                watching what went missing.
              </p>

              <h2>Why Red Dead Redemption worked</h2>
              {/* VERIFY vs video before dissemination — [07:27] ("that was one
                  that they would play together... it was a more calming...
                  it allowed them to bond and do something different together
                  they enjoyed"). */}
              <p>
                What filled the gap surprised me. Red Dead Redemption, a
                western with a Mature rating, became the game her very
                different sons played together. “That was one that they would
                play together,” she said. “It was more calming... it allowed
                them to bond and do something different together they
                enjoyed.”
              </p>
              {/* FACT: Coyne 2016 sibling co-play — fact library. */}
              <p>
                Contrary to the rating expectations, the cartoon game with the
                dancing bananas is the one that got banned, and the M-rated
                western is what came in after, on good behavior. By the sticker
                on the box she got it backwards. By the evidence in her living
                room, calmer sessions, brothers voluntarily in the same world,
                she got it exactly right. Researchers who study siblings have
                seen the same mechanism: co-playing video games is{" "}
                <a
                  href="https://www.sciencedirect.com/science/article/abs/pii/S014019711500281X"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  associated with more sibling affection
                </a>
                , which tracks with what she watched happen on her own couch.
              </p>
              {/* VERIFY vs video before dissemination — [08:35] (his own
                  sectionals wording: "calm, chill... went crazy in there";
                  the paragraph tracks his tape register on purpose).
                  DIFFERENTIATION: this is the full orchestra STORY and it
                  lives here; the sibling keeps only the one-line orchestra
                  bio. No shared text — grep before touching either. */}
              <p>
                What she was describing sounded really familiar, just from the
                other side of the screen. I was an orchestra kid. In the full
                class we were calm, pretty chill. Once the violas split off
                into sectionals, the same small room and the same faces every
                week, we went a little crazy in there, and that’s where we
                actually got close. I see it now in the kids I coach: the
                bonding happens in the small room, and the game is just what
                gets everybody in there. Her sons had found their sectional in
                a cowboy game.
              </p>
              {/* VERIFY vs video before dissemination — [08:03]. This piece
                  OWNS the "value... controlled" quote; the sibling paraphrases
                  it by design. */}
              <p>
                Her one-line policy, the closest thing to advice she offered
                all conversation: “I see a value in it as long as it’s
                controlled.”
              </p>

              <h2>Why her kids begged their dad for a private Minecraft server</h2>
              {/* VERIFY vs video before dissemination — [09:29] (libraries,
                  cities, churches, the break room with snacks, "It wasn't just
                  the stuff, it was the narrative that they put behind it...
                  their world that they had built together from creativity" —
                  caption says "was their world"; printed quote drops the
                  leading "was", confirm on video). */}
              <p>
                But the story of hers that resonated with me most was older and
                one that might sound familiar to many my age. In elementary
                school, her boys built a Minecraft world together: libraries,
                cities, churches. They built a workplace, and inside it a break
                room, stocked with snacks, so the workers would have something
                during their break. Little kids, planning for rest. “It wasn’t
                just the stuff, it was the narrative that they put behind it,”
                she told me. “Their world that they had built together from
                creativity.”
              </p>
              {/* VERIFY vs video before dissemination — [09:29] (the wreck +
                  "they wanted my husband to do a server") and [10:35] ("Such a
                  jerk move, and here's these little kids actually doing
                  something productive"). */}
              <p>
                Then a stranger got in and wrecked all of it in one night.
                “Such a jerk move, and here’s these little kids actually doing
                something productive.” Her boys were devastated, and the fix
                they begged for tells you everything: they asked their dad to
                run a private server. A world with walls, and a trusted adult
                holding the keys.
              </p>
              {/* The one product link on this page. Keep it single. EKUZO
                  presence capped at the smile-beat level by design (Jamie):
                  this is her story, not an EKUZO story. */}
              <p>
                Kids often can’t name a safe environment. They usually have to
                lose one first. I sat there nodding, because that lesson is my
                job: the kids I coach through{" "}
                <Link href="/programs/ekuzo101">EKUZO 101</Link> play on a
                private, moderated server with the same faces, the same coach,
                and the same video and voice channel every week.
              </p>

              <h2>What she actually did</h2>
              <p>
                Nothing she did required an expert. It required watching, and
                being willing to act on what she saw.
              </p>
              <p>
                She judged games individually, by the kid each one produced,
                and overruled the ratings sticker when her own eyes disagreed
                with it. She banned the one game that had rearranged her son’s
                behavior, then filled the hole it left on purpose: the family
                tried other games and held onto what gave something back, a
                western that made her boys brothers again, the block game
                where they’d built worlds since they were small. When the open
                internet cost her kids their best creative work, she didn’t
                take the game away; her family put an adult inside it.
              </p>
              {/* VERIFY vs video before dissemination — [21:12] ("the only
                  hard and fast rule was no social media period"), [22:55]
                  (the first-account story: 16, photography, the older kid who
                  called and vouched — caption says pictures for the football
                  team; the piece prints "school photography" as an in-domain
                  soften, confirm comfort on video), [24:22] ("I made him sign
                  it" — the contract on her wall/board).
                  ID variant: drop "at 16" and "for school photography" →
                  "when her younger son needed his first account in high
                  school, for a school activity". */}
              <p>
                Games weren’t the only thing she watched. “The only hard and
                fast rule was no social media, period,” she told me, and that
                rule held while her boys were growing up. So when her younger
                son needed his first account at 16, for school photography, the
                gate opened the way everything opened in her house: a
                real-world purpose, an older kid who vouched for him, and a
                written agreement posted on her wall. “I made him sign it.”
              </p>
              {/* FACT: Columbia 2025 addictive-use study — fact library.
                  "Three years after her ban" rides the ban-during-COVID-era
                  timeline she gives on tape; keep the arithmetic loose. */}
              <p>
                Three years after her ban, a{" "}
                <a
                  href="https://www.cuimc.columbia.edu/news/addictive-use-social-media-not-total-time-associated-youth-mental-health"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Columbia University study
                </a>{" "}
                found that addictive patterns of use, not total screen time,
                predicted worse mental health in young people. She’d already
                run the study in her own house, one game at a time.
              </p>
              <p>
                I came into this interview expecting to explain gaming to the
                mom who banned Fortnite. I mostly listened. We were more
                similar than we were different. She learned what games do by
                taking one away and watching what came back, and what went
                missing. I learned it by playing. Two paths, same destination:
                parents like her aren’t behind on this stuff. They’re
                generating the evidence.
              </p>
              {/* Listening-project CTA — the piece's final beat by design.
                  A calendar link, not a product link. Company social + coaches
                  seed this piece; Muhammad's network leads with the sibling. */}
              <p>
                The listening project is ongoing. I’m trying to reach 100 of
                these conversations, and every one so far has taught me
                something the last one didn’t. If you’re a parent with a
                gaming story, good, bad, or unresolved, I’d genuinely like to
                hear it.{" "}
                <a
                  href={LISTENING_CALENDAR}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Put 20 minutes on my calendar
                </a>
                .
              </p>
              {/* Locked consent boilerplate (shared across the bundle by
                  design — the only allowed shared narrator prose besides the
                  two spine quotes). */}
              <p className="italic text-black/60">
                Kassi is a real parent. Her story appears here the way she told
                it to me, with her family’s identifying details held back by
                design. It’s one family’s evidence, offered so yours can use
                it.
              </p>

              <h2>Sources and further reading</h2>
              <ul>
                {SOURCES.map((s, i) => (
                  <li key={i}>
                    {s.text}
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.cite || s.url}
                      </a>
                    ) : (
                      s.cite
                    )}
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

      {/* FooterBanner intentionally omitted on this page — see header comment. */}
      <Footer />
    </>
  );
}
