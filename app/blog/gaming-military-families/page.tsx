import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import ContinuityOfPlayGraphic from "@/components/blog/ContinuityOfPlayGraphic";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildFAQPageSchema,
  MUHAMMAD_ID,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";

/*
 * ── Kassi post (military-families piece): read before editing ────────────────
 * RETITLED + RESLUGGED + REWRITTEN 2026-07-27 (differentiation pass, then a
 * full lead-writer rewrite run through a 3-reviewer adversarial panel:
 * structural editor, voice-DNA lint + Muhammad authenticity, military-spouse
 * cold read + OPSEC kill-list audit; 2 rounds, all verdicts closed out).
 * This piece cedes the "banned Fortnite" identity to the parent piece
 * (/blog/should-you-ban-fortnite), which owns the ban arc, the research stack
 * (FTC/Coyne/Columbia), Red Dead, Minecraft, and ALL orchestra material.
 * THIS piece owns: moves / the community that travels, chair flying, the
 * military's own esports programs, Haidt, her bar for organized gaming.
 * The ban arc is compressed here and links out. Do not re-grow shared beats,
 * and do not reuse the parent piece's sentences (panel caught 5 echoes; all
 * removed — check against the parent piece before adding prose here).
 * Voice: Muhammad's (21, plain, earnest, dry). knowledge-base
 * system/methodology/voice-dna.md is law: no em dashes in prose, no banned
 * vocab/phrases, sentence-case headers. Never an editorial "we".
 * FRAMING (Jamie, 2026-07-27): a HUMAN story about a military mom and her
 * experience with gaming. Kassi is the protagonist; Muhammad is the witness.
 * EKUZO presence capped at the two sentences in "Her bar" plus the coaching
 * reflections Jamie's outline locked. Not a piece about the interview process.
 * ASK-FORGIVENESS DISCIPLINE (historical, now resolved): this was written
 * before Kassi knew of it. Every claim about the conversation matches the
 * tape, including order (coin [02:28] precedes the widower story [03:18];
 * chair flying was mid-call, so no "right away"/"near the end" claims). Her
 * moves claim rides her own "bounce all over the world" words [21:12],
 * nothing stronger. Do not add claims beyond these.
 *
 * PSEUDONYM (Jamie's call, 2026-07-28): the subject is published as CASEY.
 * Her real first name is Kassi, which is what she is called in the knowledge
 * base (company/crm/people/kassi-marshall.md), in email, and in every code
 * comment in this repo. She asked for the change on account of her military
 * background when she blessed the bundle, and it is the only change she asked
 * for. Rendered prose, schema, metadata and cross-links say Casey. Comments
 * and internal docs keep Kassi on purpose: they are the provenance trail on a
 * real person's approval, and they are not public. The consent boilerplate
 * disclosed the name change to the reader from 2026-07-31 until 2026-08-01,
 * when it was cut for length; the record now lives here and in the CRM only.
 * CITATION SWAP 2026-07-27: the mobility stat previously cited the Kadena
 * DoDEA school page (kadenaes.dodea.edu). A named-base URL under a footer
 * promising "no base appears" was an OPSEC-optics fail (spouse-read finding).
 * Now cites National Academies 2019 (25380) inline + MCEC in Sources.
 * UPDATE the fact-library entry "Military Child School Move Frequency" to
 * match (knowledge-base company/marketing/ekuzo-fact-library.md).
 * Ship state: PUBLIC as of 2026-07-31. Kassi blessed both pieces 2026-07-28,
 * having read them with her husband; Muhammad blessed them; both were on the
 * call. All six guard layers (robots meta, X-Robots-Tag, robots.txt AI-crawler
 * block, sitemap absence, /blog listing, author-page grid) were removed in the
 * same commit that published this.
 * Share path for the channel test. utm_source was "kassi" until 2026-07-31;
 * changed because this URL goes to her to share onward, and her real first
 * name sitting in a public address bar undercuts the pseudonym. No analytics
 * continuity was lost: the link was never disseminated.
 *   https://ekuzo.gg/blog/gaming-military-families?utm_source=subject-share&utm_medium=community&utm_campaign=military-families
 * Quote discipline: every verbatim was auto-caption text with inferred
 * attribution and was verified against https://youtu.be/MTS3fODxHLk before
 * dissemination. That pass is CLOSED (markers stripped 2026-07-31). If any
 * quote is edited from here on, re-verify it against the recording first.
 * Anonymization: identifying sentences carry "ID variant" comments with
 * details-changed replacements, so a comfort-edit takes 5 minutes.
 * No FooterBanner on this page by design (non-promotional piece).
 * The one-link rule governs PRODUCT links only: exactly one, to EKUZO 101
 * (inside "Her bar for organized gaming"). The listening-project calendar CTA
 * is the piece's final beat — it is not a product link.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SLUG = "gaming-military-families";
const TITLE_DISPLAY =
  "Every move wiped their friend map. Gaming was the community that traveled.";
// Meta <title> names the lane ("gaming and military kids") for search/reference;
// OG/Twitter cards carry the emotional H1 for shares.
const TITLE_META = "Gaming and military kids: the community that travels";
const SUBHEAD =
  "I grew up through gaming. She's a military mom who banned Fortnite. We spent 48 minutes agreeing with each other.";
const DESCRIPTION =
  "Military kids move constantly, and every move wipes the friend map. A military mom and a 21-year-old esports coach on the gaming communities that travel.";
const HERO_IMAGE = "/images/gaming-military-families-hero.jpg";
const HERO_ALT =
  "A teenager sits with their back to the camera at a desk in a half-unpacked room, teammates on one monitor and a game on the other, while a moving truck waits outside the open door at dusk.";
// Share image is its own 1200x630 file, NOT the 1731x909 hero. Every share
// debugger wants 1200x630, and the declared dimensions below have to match the
// actual file or the schema carries a lie.
const SHARE_IMAGE = "/images/gaming-military-families-share.jpg";
const DATE_PUBLISHED = "2026-07-25";
const DATE_MODIFIED = "2026-07-31";
// Listening-project CTA (final beat of the post). Not a product link.
const LISTENING_CALENDAR = "https://calendar.app.google/mMJ5KoxcNdH6SR13A";

// Every claim in the post that carries a number or an institutional fact.
// Each one also resolves to an entry in knowledge-base ekuzo-fact-library.md.
const SOURCES: { text: string; cite: string; url: string }[] = [
  {
    text: "National Academies of Sciences, Engineering, and Medicine, ",
    cite: "Strengthening the Military Family Readiness System for a Changing American Society (2019), on school-change frequency for military-connected students.",
    url: "https://www.nationalacademies.org/publications/25380",
  },
  {
    text: "Military Child Education Coalition, ",
    cite: "on how often a military-connected child can expect to move between kindergarten and graduation (2020).",
    url: "https://www.militarychild.org/news/press-releases/2020/mcec-survey-reveals-significant-concerns-for-militaryconnected-students",
  },
  {
    text: "U.S. Army Recruiting Command, ",
    cite: "Army Esports Team.",
    url: "https://recruiting.army.mil/army_esports/",
  },
  {
    text: "USNI News, ",
    cite: "on the Navy’s “Goats & Glory” esports team (August 2022).",
    url: "https://news.usni.org/2022/08/26/wanted-gamer-sailors-for-navys-goats-glory-esports-team",
  },
  {
    text: "Air Force Services Center, ",
    cite: "Air Force Gaming.",
    url: "https://myairforcelife.com/air-force-gaming/",
  },
  {
    // Renders in the Sources list, so it carries the pseudonym like all other
    // public-facing prose.
    text: "Jonathan Haidt, The Anxious Generation (2024), the book Casey kept quoting.",
    cite: "",
    url: "",
  },
];

// Common questions. Added 2026-07-31, at the flip. Every Perspective post on
// this blog carries one; these two were the only ones without. Google requires
// FAQ content to be visible on the page, so this renders as a real section AND
// feeds buildFAQPageSchema. Do not add schema without the section.
// SCOPE RULE: every answer is drawn from material already in the piece above.
// No new claim about her, no new tape, no product link.
// DIFFERENTIATION: these questions are this piece's lane (moves, the community
// that travels, chair flying, her two gates). The sibling's FAQ owns the ban
// arc and the game-by-game verdicts. Contamination-grep before adding to
// either, same rule as the body prose.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Can video games help children adjust after moving?",
    answer:
      "Games offer familiar friends, routines, and communities that remain accessible across moves. For Casey, her kids started a new game, Fortnite, and she admitted it served its purpose in giving social connection.",
  },
  {
    question: "Are online friends enough when a child loses everyone in a move?",
    answer:
      "They are not a substitute for a room with people in it. Casey would say so first. Her sharpest point in 48 minutes was that kids need real in-person spaces too, and a server is not automatically that. What an online group does is survive the move. The same people who were there before the orders dropped are still there the week after, which counts for something when everything else in a kid’s life has just reset.",
  },
  {
    question: "Does the military actually support gaming?",
    answer:
      "It funds it. Three service programs came up in our conversation: the Army’s official esports team, the Navy’s, stood up by official message, and Air Force Gaming, which is open to Airmen and Guardians. Casey’s read on why they exist was one line: “because of the strategy involved.” The idea that games rehearse real judgment is old news in her world, old enough that there is a budget for it.",
  },
  {
    question: "Do video games teach anything that carries into real life?",
    answer:
      "Casey gave me the best framing I have heard for this, and it came from her flying rather than her parenting. Military aviators practice something called chair flying, mentally walking through every step of a flight before they ever touch the aircraft. A simulator, she says, puts your mind in the environment. Every ranked match I have played was preceded by the same mental walk-through. Games provide opportunities to practice communication, preparation, decision-making, and emotional regulation. But merely playing them does not automatically teach those skills.",
  },
  {
    question: "What should I ask before signing my kid up for an esports program?",
    answer:
      "Two, and Casey softened neither. On the coaching: “Do they have training on coaching... or is it just some folks who are good at esports?” She is asking whether an adult is tracking the child rather than only the scoreboard. On the money: who pays for this, and does an academic or ethical body stand behind the program, or is the gaming industry buying a way into younger kids.",
  },
];

const KEEP_READING = [
  // Cross-card to the sibling piece (added 2026-07-28, when the parent page
  // was built). Replaced the K1ng case-study card to keep 3 in the grid —
  // the bundle cross-link outranks it. Card image pending (art direction TBD).
  {
    slug: "should-you-ban-fortnite",
    title:
      "She banned Fortnite and got her kid back. Then came a new problem.",
    blurb:
      "The other half of Casey's story: the full ban arc, Fort-Holes, and the games that earned their place.",
    image: "/images/should-you-ban-fortnite-card.jpg",
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
    images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: TITLE_DISPLAY }],
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
  robots: { index: true, follow: true },
};

export default function PostGamingMilitaryFamilies() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
    // Resolves to the canonical Person node in rootGraph (added at the flip,
    // 2026-07-31) rather than minting a second, unlinked Muhammad.
    author: { "@id": MUHAMMAD_ID },
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

        {/* ══ HERO ═════════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto mb-20"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Finalised 2026-07-30. Photo-illustration: the teenager from
              behind in a half-unpacked room, the truck through the open door
              at dusk, teammates on one monitor and the game on the other.
              Consent constraints hold: no faces toward camera, no rank
              insignia, no unit or base markings, no photos of the family.
              The 16:10 card crop and the 1200x630 share crop come from this
              same frame; see -card.jpg and -share.jpg. */}
          <Image
            src={HERO_IMAGE}
            alt={HERO_ALT}
            width={1731}
            height={909}
            priority
            sizes="(max-width: 1232px) 100vw, 1024px"
            className="w-full h-auto"
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
                Howdy. I’m Muhammad. I’m a rising senior at Texas A&amp;M, and I
                coach kids in League of Legends for a youth esports startup
                called EKUZO. My internship this summer comes with a listening
                project: I sit down with parents, ask about gaming and screens,
                and try to find the gap between what they see and what their
                kids are living. I’m an English major, so getting to write the
                stories down is my favorite part.
              </p>
              {/* ID variant, if she ever asks for more distance: "The first
                  parent to sign up was a senior military officer. Casey is a
                  career officer already deep into what's next for her:
                  researching resilience in military families. She's a mom of
                  two boys, and the parent who banned Fortnite." (drops AF +
                  pilot + Aggie) */}
              {/* No calendar link up here (Jamie asked, lead-writer call): one
                  CTA per piece, at the end, after the story has earned it; an
                  inline recruit link in her intro paragraph would make her
                  story read as lead-gen on her cold read. The "(help me!)"
                  energy goes in Muhammad's LinkedIn share copy instead. */}
              <p>
                The first parent I got to sign up was a senior Air Force
                officer.
                Casey is a pilot by background, already deep into what’s next
                for her: researching resilience in military families. She’s an
                Aggie, a mom of two boys, and the parent who banned Fortnite.
              </p>
              {/* Tape [02:28] (coin quote).
                  TAPE ORDER PRESERVED: the coin line [02:28] came BEFORE the
                  widower story [03:18]; don't reverse or imply the widower
                  story prompted the coin.
                  The widower anecdote is an identifiable third party's grief
                  story. It was named explicitly in her review email, and her
                  2026-07-28 sign-off covers it. */}
              <p>
                The conversation got real before I’d finished my own
                introduction. Her research and my project kept overlapping, and
                two minutes in I heard myself say we might be like “two sides
                of the same coin.” Then she told me about a military member she
                knows who lost his wife, and how it was his online gaming
                community that carried him through it, more than anyone in
                person. Gaming is where my own social life came from. I knew
                exactly what she was describing.
              </p>

              <h2>She called it chair flying</h2>
              {/* Tape [17:48]. No conversation-order claim here on purpose:
                  this happened mid-call. Don't add one. */}
              <p>
                Take flight simulators. I brought them up half expecting an
                actual pilot to laugh at me. Instead the pilot took over from
                the mom. She told me about chair flying, the discipline where
                military aviators rehearse a flight before they ever touch the
                aircraft: “mentally walking through every step you’re going to
                take in order to practice.” A simulator, she said, puts your
                mind in the environment. I’ve done a version of that before
                every ranked match of my life and only ever called it practice.
                I’m stealing her word. Chair flying sounds a lot more serious.
              </p>
              {/* FACT: "Official Military Branch Esports Programs" — fact
                  library, official service sources. Army recruiting-domain
                  link lives in Sources ONLY (spouse-group finding, 7/25).
                  Tape [17:29]: her line is "because the strategy involved";
                  the inserted "of" is caption cleanup.
                  ID variant, if she ever asks for more distance: delete the
                  task-force sentence entirely. */}
              <p>
                Her whole world runs on the same idea. The Army fields an
                official esports team, the Navy stood one up by official
                message, and{" "}
                <a
                  href="https://myairforcelife.com/air-force-gaming/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Air Force Gaming
                </a>{" "}
                is the Air Force’s own program for Airmen and Guardians.
                Casey’s read on why the branches built those: “because of the
                strategy involved.” The idea that games rehearse real judgment
                is old news in her world, old enough that there’s a budget for
                it. She’s even loosely connected to a research task force at
                work that teaches wargaming alongside PhDs who study games.
              </p>
              <p>
                She’d done the reading, too. Her resilience research keeps
                leading her back to childhood, to the idea that the strength
                you need as an adult gets built or broken years earlier. She
                quoted Jonathan Haidt’s The Anxious Generation so often she
                apologized for it, then assigned it to me as homework. I’ve
                started it. So when she got to her own boys, none of it was
                theory.
              </p>

              <h2>The game that had its purpose</h2>
              {/* FACT: "Military Child School Move Frequency" — fact library.
                  SOURCE SWAPPED 2026-07-27: was the Kadena DoDEA school page
                  (named-base OPSEC optics); now National Academies 2019
                  (nationalacademies.org/publications/25380) + MCEC in Sources.
                  Update the fact-library entry to match. */}
              <p>
                According to a{" "}
                <a
                  href="https://www.nationalacademies.org/publications/25380"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2019 National Academies report
                </a>
                , military kids change schools 6 to 9 times between
                kindergarten and graduation, about 3 times more often than
                their civilian peers. Each move wipes the friend map clean, and
                the communities that survive are the ones that travel.
              </p>
              {/* Tape [21:12] ("we're military and we would bounce all over
                  the world"). Her own words carry the moves claim; don't
                  overstate beyond them.
                  ID variant, if she ever asks for more distance: "Her family,
                  in her words, 'would bounce all over the world,' and one of
                  those bounces landed right as COVID hit." (drops overseas) */}
              <p>
                Casey’s boys lived that statistic. Her family, in her words, “would
                bounce all over the world,” and one of those bounces dropped
                the boys overseas right as COVID hit.
              </p>

              {/* "The continuity of play." Inlined as SVG rather than the PNG
                  so its 11px tracked labels stay legible on a phone, where
                  they would otherwise land at roughly 4px. The PNG at
                  /images/gaming-military-families-friend-map.png stays as the
                  shareable asset. Do not regenerate the artwork; the source
                  SVG is knowledge-base/outputs/ekuzo-continuity-of-play.svg. */}
              <ContinuityOfPlayGraphic />

              {/* Tape [06:20]. */}
              <p>
                Fortnite was where the people were. An entire ocean from every
                friend they had, locked down, her boys needed a community that
                could still reach them. She made a call she can still defend
                and still hates: she gave them the game. Her line about that
                season is one I keep repeating to people: “Fortnite, even
                though I think it’s the devil, had its purpose.”
              </p>
              {/* Tape [16:20]. Son's name replaced with "[my son]" to protect
                  his privacy. The bracketed substitution is deliberate and
                  stays: she did not ask for the name back when she blessed the
                  piece.
                  ID variant, if she ever asks for more distance: "One of her
                  sons' behavior started bending around the game." */}
              <p>
                The purpose didn’t last. Her younger son’s behavior started
                bending around the game, and grounding him from it just made
                the game the center of everything. So the family banned it
                outright. She summed up what came next in one breath: “Oh, [my
                son] is back.”
              </p>
              {/* Ban arc compressed — the full story lives in the parent piece
                  (/blog/should-you-ban-fortnite). Don't re-grow shared beats
                  here, and don't quote her "value... controlled" line (the
                  parent piece owns it; this is a paraphrase on purpose).
                  POV: Muhammad's "I wrote it up" — never an editorial "we". */}
              {/* Fort-Hole appears here as a TEASER only; the parent piece
                  owns the coinage story. Parents smile at the term; that's
                  the pull for the cross-link (Jamie, 2026-07-27). */}
              <p>
                What she did after the ban got big enough that I wrote it up as{" "}
                <Link href="/blog/should-you-ban-fortnite">
                  its own post
                </Link>
                , starting with the name she coined for what the game was
                turning her teenagers into: Fort-Holes. The short version: the
                game had been doing more jobs in her house than anyone
                realized, and she still sees value in gaming where there’s
                structure and an adult in the room.
              </p>

              <h2>Her bar for organized gaming</h2>
              {/* Tape [40:32]. */}
              <p>
                When I asked what’s important to her in structured gaming, she
                brought up two things. The first was the adults: “Do they have
                training on coaching... or is it just some folks who are good
                at esports? There’s a big difference.” She wants a trained
                adult in the room, someone watching how the kid develops, with
                the gameplay as the smaller part of the job. The second was the
                money. Who pays for this? She wanted to know whether an
                academic or ethical body stood behind a program, or whether the
                gaming industry was funding a way into younger kids.
              </p>
              {/* The one product link on this page. Keep it single. EKUZO
                  presence capped at these two sentences by design (Jamie,
                  2026-07-27): this is her story, not an EKUZO story. */}
              <p>
                She never softened either question for me, which is why I trust
                everything else she said. I smiled at the first one, because
                she’d basically described my week coaching{" "}
                <Link href="/programs/ekuzo101">EKUZO 101</Link>: same small
                group, private server, a coach in the voice channel. The money
                one was even easier: we don’t have a sponsor; we’re a small,
                self-funded startup. She nodded. That was it.
              </p>
              {/* Non-endorsement paragraph: keep directly adjacent to the
                  EKUZO/funding paragraph above (OPSEC adjacency rule).
                  ID variants, if she ever asks for more distance: "Her kids
                  are older teens, mostly past our age range" · "She's a
                  serving officer." */}
              {/* Takeaway reframed per Jamie 2026-07-27 (from his debrief with
                  Muhammad): what Muhammad actually got was her knowledge
                  surprising him + the moving challenge, not "questions to ask
                  programs." Keeps the piece hers, not EKUZO's. */}
              <p>
                Her kids are teenagers, mostly past our age range, and she
                wasn’t shopping. She’s an active-duty officer, and none of this
                is an endorsement of us or anyone else. And honestly, the
                questions weren’t even my big takeaway. What I walked away with
                was how much she already knew, and a challenge I’d never had to
                think about: rebuilding your whole world every time the orders
                drop. Military kids get the extreme version, but some version
                of it comes for a lot of kids anyway.
              </p>

              <h2>Where we landed</h2>
              {/* Tape [24:38] ("I don't know that we've done it right or
                  wrong"). Said about their screen/social-media calls; keep it
                  paraphrased and general, don't quote it against a different
                  decision. */}
              <p>
                What stays with me is how often we arrived at the same place
                from opposite directions. She treats games the way her world
                treats any tool: use it carefully, because if you stop paying
                attention it starts using you. That’s the exact discipline the
                military applies to everything powerful it owns. She just
                brought it home. She watched what each game took
                from her boys and what it gave them, and she acted on what she
                saw, one game at a time. And she told me straight out that she
                doesn’t know if they made every call right. Somehow that made
                me trust her calls more, not less. I learned the same things
                from the inside, by playing. Two sides of the same coin.
              </p>
              {/* Tape [18:49]. Reframed per
                  Jamie 2026-07-27: agreement-in-different-words (discovery
                  structure), not a manufactured disagreement — on the yelling
                  they genuinely agree. The trust beat survives as the one
                  honestly open question (rooms vs servers), per the 7/25
                  panel's finding that an unanswered point is what makes the
                  piece trustworthy. */}
              {/* The hand-back happens IN THE PIECE, on purpose: he never said
                  "tilt" to her on tape, so it's framed as his trade now, not a
                  conversation claim. Mirrors chair flying: each side has the
                  word the other lacks. */}
              <p>
                I thought we’d finally found the thing we disagreed on. She’s
                skeptical that online play teaches real group skills at all:
                “at no point would you ever in a group dynamic yell and holler
                at the top of your lungs at somebody.” But the longer I sat
                with it, the more it sounded like agreement in different words.
                She was describing something gamers know so well we have names
                for it: crashing out, going on tilt. A kid mid-tilt isn’t
                learning teamwork; he’s just loud. Keeping your cool under
                pressure is a skill. Her world trains it on purpose, and
                talking kids down from the tilt is half of what coaching
                actually is. She’d already handed me a better word for my
                practice. This one is mine to hand back. Her deeper point is
                the one still open, for us and everyone else working on this:
                kids need real, in-person rooms too, and a server isn’t
                automatically that.
              </p>
              <p>
                That’s the job as I understand it: a coach in the room for
                exactly those moments, so kids have fun, build some of that
                strength early, and walk away with friends and skills that go
                with them, wherever the next move lands them.
              </p>
              {/* Tape [46:02] ("a little bit
                  different"). Her amplify offer stays UNPUBLISHED (7/25 kill);
                  she is quoted only for what's on tape, and the more-stories
                  claim is Muhammad's stated belief. */}
              <p>
                She told me the military community is “a little bit different”
                from the civilian one. After 48 minutes I believed her, and I
                believe it holds a lot more stories like hers: families who
                moved a kid across the world and watched a game be the thing
                that traveled with them. I want to hear every one of them.
              </p>
              {/* Listening-project CTA — the piece's final beat by design.
                  A calendar link, not a product link. This is the piece
                  Muhammad seeds. */}
              <p>
                If your family has one of those stories, whatever shape it’s
                in,{" "}
                <a
                  href={LISTENING_CALENDAR}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  put 20 minutes on my calendar
                </a>
                . I’d like to listen.
              </p>
              {/* Consent boilerplate. Shared across the bundle by design: the
                  only allowed shared narrator prose besides the two spine
                  quotes. Any edit here gets made in BOTH pieces.
                  CUT 2026-08-01 (Jamie, reading it live) to match the sibling.
                  The second sentence is NOT decorative and does not travel to
                  the sibling: the 2026-07-25 military-spouse cold read and
                  OPSEC audit treated "no base appears" as a promise the piece
                  makes, and it drove the citation swap off the named-base
                  DoDEA URL. Removing the promise while keeping the reasons for
                  it would be the wrong half to cut. */}
              <p className="italic text-black/60">
                Casey is a real parent sharing her real story, offered so yours
                can use it. Her surname, unit, and base do not appear here, by
                design.
              </p>

              <h2>Common questions</h2>
              {FAQ_ITEMS.map((item) => (
                <Fragment key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </Fragment>
              ))}

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
