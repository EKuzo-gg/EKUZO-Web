import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogContent from "@/components/blog/BlogContent";
import WireframePlaceholder from "@/components/blog/WireframePlaceholder";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

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
 * ASK-FORGIVENESS DISCIPLINE: Kassi does not know this was written. Every
 * claim about the conversation must match the tape, including order (coin
 * [02:28] precedes the widower story [03:18]; chair flying was mid-call, so
 * no "right away"/"near the end" claims). Her moves claim rides her own
 * "bounce all over the world" words [21:12], nothing stronger.
 * CITATION SWAP 2026-07-27: the mobility stat previously cited the Kadena
 * DoDEA school page (kadenaes.dodea.edu). A named-base URL under a footer
 * promising "no base appears" was an OPSEC-optics fail (spouse-read finding).
 * Now cites National Academies 2019 (25380) inline + MCEC in Sources.
 * UPDATE the fact-library entry "Military Child School Move Frequency" to
 * match (knowledge-base company/marketing/ekuzo-fact-library.md).
 * Ship state: LIVE BUT UNDISSEMINATED pending Kassi's blessing (email offers
 * changes). robots is index:false and the post is NOT in sitemap.ts until she
 * blesses it — flip robots to index:true and add the sitemap entry then.
 * ALSO AT THE FLIP (added 2026-07-28, when the author layer shipped): run the
 * TO PUBLISH checklist in app/blog/author/muhammad-hossain/page.tsx. That page
 * is dark for the same reason and flips at the same moment as both posts.
 * Share path for the channel test (hand these to Kassi/Muhammad only):
 *   https://ekuzo.gg/blog/gaming-military-families?utm_source=kassi&utm_medium=community&utm_campaign=military-families
 * Quote discipline: every verbatim is auto-caption text with inferred
 * attribution — VERIFY each against https://youtu.be/MTS3fODxHLk before
 * dissemination (markers inline below).
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
const SHARE_IMAGE = "/images/gaming-military-families-hero.jpg"; // asset pending — see wrap report asset list
const DATE_PUBLISHED = "2026-07-25";
const DATE_MODIFIED = "2026-07-27";
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
    text: "Jonathan Haidt, The Anxious Generation (2024), the book Kassi kept quoting.",
    cite: "",
    url: "",
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
      "The other half of Kassi's story: the full ban arc, Fort-Holes, and the games that earned their place.",
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
  // piece, then flip index to true and add the sitemap entry.
  robots: { index: false, follow: true },
};

export default function PostGamingMilitaryFamilies() {
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

        {/* ══ HERO (asset pending) ══════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto mb-20"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <WireframePlaceholder
            type="image"
            label="Hero: two worlds, one conversation"
            note="Photo-illustration, split composition: flight-line/cockpit silhouette at dusk on one side, warm home gaming setup on the other, meeting at a center seam (optional coin motif in the seam). No faces, no rank insignia, no unit or base markings, no photos of Kassi or her kids. 1920x1080; must crop cleanly to 1200x630 for OG. Save as /images/gaming-military-families-hero.jpg. Design brief to Aaron; stock composite or illustration."
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
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16 items-start">
            {/* Left: byline */}
            <div className="lg:sticky lg:top-28 flex flex-col gap-1">
              <span className="font-body text-black/40 text-sm">
                Published July 25, 2026
              </span>
              <span className="font-body text-black/60 text-sm">
                by{" "}
                <Link
                  href="/blog/author/muhammad-hossain"
                  className="hover:text-red transition-colors"
                >
                  <strong className="text-black">Muhammad Hossain</strong>
                </Link>
              </span>
              <span className="font-body text-black/40 text-xs mt-1">
                EKUZO coach · Texas A&amp;M
              </span>
            </div>

            {/* Right: post content */}
            <BlogContent>
              <p>
                Howdy. I’m Muhammad. I’m a rising senior at Texas A&amp;M, and I
                coach kids in League of Legends for a youth esports startup
                called EKUZO. My internship this summer comes with a listening
                project: I sit down with parents, ask about gaming and screens,
                and try to find the gap between what they see and what their
                kids are living. I’m an English major, so getting to write the
                stories down is my favorite part.
              </p>
              {/* ID variant: "The first parent to sign up was a senior
                  military officer. Kassi is a career officer already deep into
                  what's next for her: researching resilience in military
                  families. She's a mom of two boys, and the parent who banned
                  Fortnite." (drops AF + pilot + Aggie) */}
              {/* No calendar link up here (Jamie asked, lead-writer call): one
                  CTA per piece, at the end, after the story has earned it; an
                  inline recruit link in Kassi's intro paragraph would make her
                  story read as lead-gen on her cold read. The "(help me!)"
                  energy goes in Muhammad's LinkedIn share copy instead. */}
              <p>
                The first parent I got to sign up was a senior Air Force
                officer.
                Kassi is a pilot by background, already deep into what’s next
                for her: researching resilience in military families. She’s an
                Aggie, a mom of two boys, and the parent who banned Fortnite.
              </p>
              {/* VERIFY vs video before dissemination — [02:28] (coin quote).
                  TAPE ORDER PRESERVED (ask-forgiveness discipline): coin line
                  [02:28] came BEFORE the widower story [03:18]; don't reverse
                  or imply the widower story prompted the coin.
                  KASSI-EMAIL FLAG: the widower anecdote is an identifiable
                  third party's grief story; name it explicitly in her review
                  email so her sign-off covers it. */}
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
              {/* VERIFY vs video before dissemination — [17:48]. No
                  conversation-order claim here on purpose: this happened
                  mid-call, and she'll read this piece cold. */}
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
                  VERIFY vs video before dissemination — [17:29]: her line is
                  "because the strategy involved"; the inserted "of" is caption
                  cleanup, confirm on video.
                  ID variant: delete the task-force sentence entirely. */}
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
                Kassi’s read on why the branches built those: “because of the
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
              {/* VERIFY vs video before dissemination — [21:12] ("we're
                  military and we would bounce all over the world"). Her own
                  words carry the moves claim; don't overstate beyond them.
                  ID variant: "Her family, in her words, 'would bounce all
                  over the world,' and one of those bounces landed right as
                  COVID hit." (drops overseas) */}
              <p>
                Kassi’s boys lived that statistic. Her family, in her words, “would
                bounce all over the world,” and one of those bounces dropped
                the boys overseas right as COVID hit.
              </p>

              <WireframePlaceholder
                type="image"
                label="The friend map: move, wipe, what travels"
                note="Horizontal 3-beat narrative graphic: (1) PCS move, friend map wiped clean (annotate with the 6-9 school changes / 3x civilian stat), (2) the community that travels — the game world that comes along in the moving boxes, (3) an adult in the room — structure chosen. EKUZO type system, brand red accents on off-white. ~2000x700. Design brief to Aaron. Save as /images/gaming-military-families-friend-map.png."
                height={300}
              />

              {/* VERIFY vs video before dissemination — [06:20] */}
              <p>
                Fortnite was where the people were. An entire ocean from every
                friend they had, locked down, her boys needed a community that
                could still reach them. She made a call she can still defend
                and still hates: she gave them the game. Her line about that
                season is one I keep repeating to people: “Fortnite, even
                though I think it’s the devil, had its purpose.”
              </p>
              {/* VERIFY vs video before dissemination — [16:20]. Son's name
                  replaced with "[my son]" to protect his privacy; the bracketed
                  substitution is deliberate and stays even after blessing
                  unless Kassi asks for the name back.
                  ID variant: "One of her sons' behavior started bending around
                  the game." */}
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
              {/* VERIFY vs video before dissemination — [40:32] */}
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
                  ID variants: "Her kids are older teens, mostly past our age
                  range" · "She's a serving officer." */}
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
              {/* VERIFY vs video before dissemination — [24:38] ("I don't
                  know that we've done it right or wrong"). Said about their
                  screen/social-media calls; keep it paraphrased and general,
                  don't quote it against a different decision. */}
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
              {/* VERIFY vs video before dissemination — [18:49]. Reframed per
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
              {/* VERIFY vs video before dissemination — [46:02] ("a little bit
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
              <p className="italic text-black/60">
                Kassi is a real parent. Her surname, unit, and base do not
                appear here, by design, and her story is told the way she told
                it to me. It travels no further until she has read every word
                and told us it is right.
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
            </BlogContent>
          </div>
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
