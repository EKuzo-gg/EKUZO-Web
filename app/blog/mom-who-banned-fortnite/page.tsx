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
 * ── Kassi post: read before editing ──────────────────────────────────────────
 * Ship state: LIVE BUT UNDISSEMINATED pending Kassi's blessing (email offers
 * changes). robots is index:false and the post is NOT in sitemap.ts until she
 * blesses it — flip robots to index:true and add the sitemap entry then.
 * Share path for the channel test (hand these to Kassi/Muhammad only):
 *   https://ekuzo.gg/blog/mom-who-banned-fortnite?utm_source=kassi&utm_medium=community&utm_campaign=military-families
 * Quote discipline: every verbatim is auto-caption text with inferred
 * attribution — VERIFY each against https://youtu.be/MTS3fODxHLk before
 * dissemination (markers inline below).
 * Anonymization: every identifying sentence carries an "ID variant" comment
 * with its details-changed replacement, so a comfort-edit takes 5 minutes.
 * No FooterBanner on this page by design (non-promotional piece; the enroll
 * strip fails Jamie's "no sign-up framing anywhere" rule for this post).
 * Facts resolve to knowledge-base/company/marketing/ekuzo-fact-library.md:
 *   - "Military Child School Move Frequency" (DoDEA: https://kadenaes.dodea.edu/student-transition)
 *   - "Addictive Use Not Total Time" (https://www.cuimc.columbia.edu/news/addictive-use-social-media-not-total-time-associated-youth-mental-health)
 *   - "Official Military Branch Esports Programs" (https://recruiting.army.mil/army_esports/ · https://news.usni.org/2022/08/26/wanted-gamer-sailors-for-navys-goats-glory-esports-team · https://myairforcelife.com/air-force-gaming/)
 * Per the one-link rule (exactly one link, to EKUZO 101), fact sources are
 * named in prose, not hyperlinked. Add a linked Sources block only if Jamie
 * overrules.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SLUG = "mom-who-banned-fortnite";
const TITLE_DISPLAY = "The mom who banned Fortnite and the coach who grew up gaming";
const SUBHEAD =
  "I grew up through gaming. She banned Fortnite from her house. We spent 48 minutes agreeing with each other.";
const DESCRIPTION =
  "She banned Fortnite. He grew up through gaming. A senior Air Force officer and a 21-year-old esports coach talked for 48 minutes and kept agreeing.";
const SHARE_IMAGE = "/images/mom-who-banned-fortnite-hero.jpg"; // asset pending — see wrap report asset list
const DATE_PUBLISHED = "2026-07-25";
const DATE_MODIFIED = "2026-07-25";

const KEEP_READING = [
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
  {
    slug: "our-family-s-esports-journey-with-ekuzo-and-the-k1ng",
    title: "Our family’s esports journey with EKUZO and the K1ng",
    blurb: "Ryan’s story, in his mom’s words.",
    image: "/images/blog-post-1-card.jpg",
    category: "Case Studies",
  },
];

export const metadata = {
  alternates: { canonical: `/blog/${SLUG}` },
  title: TITLE_DISPLAY,
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

export default function PostMomWhoBannedFortnite() {
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
            note="Photo-illustration, split composition: flight-line/cockpit silhouette at dusk on one side, warm home gaming setup on the other, meeting at a center seam (optional coin motif in the seam). No faces, no rank insignia, no unit or base markings, no photos of Kassi or her kids. 1920x1080; must crop cleanly to 1200x630 for OG. Save as /images/mom-who-banned-fortnite-hero.jpg. Design brief to Aaron; stock composite or illustration."
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
                by <strong className="text-black">Muhammad Hossain</strong>
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
                called EKUZO. Part of my internship this summer is a listening
                project: I talk with parents about gaming and screens, and try
                to find the gap between what they see and what their kids are
                living.
              </p>
              {/* ID variant: "I posted a blurb about it in a parents' Facebook
                  group. The first person to sign up was a senior military
                  officer." */}
              <p>
                I posted a blurb about it in an Aggie Moms Facebook group. The
                first person to sign up was a senior Air Force officer.
              </p>
              {/* ID variant: "Kassi is a career officer already deep into her
                  next act: researching family resilience and prevention work
                  for military families. She's a mom of two boys, and the
                  parent who banned Fortnite." (drops pilot + Aggie) */}
              <p>
                Kassi is a pilot by background, already deep into her next act:
                researching family resilience and prevention work for military
                families. She’s an Aggie, a mom of two boys, and the parent who
                banned Fortnite.
              </p>
              <p>
                Me, I’m 21, and gaming is where my social life came from. I was
                an orchestra kid, great in class and lost everywhere else, and
                the friendships I built through games taught me how to reach
                out to people at all. She matched it with a story of her own,
                offered early and unprompted, the way you hand someone evidence
                against your own position: a military member she knows lost his
                wife, and it was his online gaming community that carried him,
                more than anyone in person.
              </p>
              {/* VERIFY vs video before dissemination — [02:28] */}
              <p>
                Two minutes in, I heard myself say we might be like “two sides
                of the same coin.”
              </p>

              <h2>The game that had its purpose</h2>
              {/* ID variant: "Her family moved constantly, so her kids'
                  in-person world got reset over and over. One of those resets
                  landed right as COVID hit." */}
              <p>
                Her family is military, so her kids’ in-person world got reset
                over and over. One of those resets dropped them overseas right
                as COVID hit.
              </p>
              {/* FACT: "Military Child School Move Frequency" — fact library,
                  DoDEA Student Transition Program */}
              <p>
                According to the Department of Defense Education Activity’s
                student transition data, military kids move 3 times more often
                than their civilian peers, and many attend 6 to 9 schools
                before they graduate. Each move wipes the friend map clean. The
                communities that survive are the ones that travel.
              </p>
              {/* VERIFY vs video before dissemination — [06:20] */}
              <p>
                So when her locked-down boys found Fortnite an ocean away from
                everyone they knew, she made a call she can still defend and
                still hates: she let them have it. They needed people, and the
                game was where the people were. Her verdict on that season is
                the most honest gaming sentence I’ve heard from a parent:
                “Fortnite, even though I think it’s the devil, had its
                purpose.”
              </p>
              {/* VERIFY vs video before dissemination — [16:20]. Son's name
                  replaced with "[my son]" to protect his privacy; the bracketed
                  substitution is deliberate and stays even after blessing
                  unless Kassi asks for the name back.
                  ID variant: "One of her sons' behavior started bending around
                  the game." */}
              <p>
                Then the purpose ran out. Her younger son’s behavior started
                bending around the game. Grounding him from it made things
                worse, because everything he did was aimed at getting back on.
                So they banned it. Her memory of what happened next is one
                short line of relief: “Oh, [my son] is back.”
              </p>
              {/* VERIFY vs video before dissemination — [16:37] */}
              <p>
                The research came after. She read about how the game
                deliberately targets dopamine responses in kids, and decided
                the people who built it that way “should be put in prison for
                it.” I told her the mechanics reminded me of casinos. She
                agreed fast.
              </p>
              {/* ID variant: "her two very different kids"
                  FACT: "Addictive Use Not Total Time" — fact library,
                  Columbia/Weill Cornell 2025 */}
              <p>
                What makes her house a small study instead of a cautionary tale
                is what she kept. Red Dead Redemption stayed, because it was
                the one game her two very different sons would actually play
                together. Her whole stance fits in a sentence: she sees real
                value in gaming, as long as it’s controlled. And the research
                is catching up to her. A 2025 study from researchers at
                Columbia University and Weill Cornell Medicine found that
                addictive patterns of use predicted worse mental health in
                young people, while total screen time didn’t. She ran that
                experiment in her own house before the paper existed.
              </p>

              <WireframePlaceholder
                type="image"
                label="The arc: move, community, hijack, structure"
                note="Horizontal 4-beat narrative graphic: (1) PCS move, friend map wiped (annotate with the DoDEA 3x / 6-9 schools stat), (2) community found, the game that traveled, (3) design hijack, the dopamine loop closes, (4) structure chosen, walls plus a trusted adult. EKUZO type system, brand red accents on off-white. ~2000x700. Design brief to Aaron. Save as /images/mom-who-banned-fortnite-arc.png."
                height={300}
              />

              <h2>The city with the break room</h2>
              {/* ID variant: "her kids, in elementary school, building a
                  Minecraft world together" */}
              <p>
                The story I keep retelling is older: her boys in elementary
                school, building a Minecraft world together, libraries,
                churches, whole cities. They built a workplace, and inside the
                workplace they built a break room, and they stocked it with
                snacks so the workers would have something on their break.
                Little kids, planning for rest.
              </p>
              <p>
                Then a stranger got into the server and wrecked all of it in a
                night. The buildings were the least of it. What her boys lost
                was the story underneath them, a world two brothers had
                invented together out of nothing.
              </p>
              {/* ID variant: "they asked a parent to run a private server" */}
              <p>
                The fix they begged for: they asked their dad to run a private
                server. Two elementary schoolers, griefed once, asking for a
                known space with a trusted adult holding the keys. Kids can
                name what a safe environment is. They usually have to lose one
                first.
              </p>
              {/* The one product link on this page. Keep it single. */}
              <p>
                I sat there nodding harder than I should admit, because the
                request was familiar. The kids I coach through{" "}
                <Link href="/programs/ekuzo101">EKUZO 101</Link> play on a
                private, moderated server, the same faces every week, a coach
                in the voice channel.
              </p>

              <h2>Her two questions</h2>
              {/* VERIFY vs video before dissemination — [40:32] */}
              <p>
                She never once softened for me, which is why I trust everything
                else she said. When I asked what would make her sign a kid up
                for a program like ours, or even recommend one, she went
                straight at it: “Do they have training on coaching... or is it
                just some folks who are good at esports? There’s a big
                difference.” She wants a trained adult in the room, someone
                watching the kid’s development, with the gameplay as the
                smaller part of the job.
              </p>
              {/* ID variant: "Her second question was sharper: who pays for
                  this?" */}
              <p>
                Her second question came out pure investigator: who pays for
                this? She wanted to know whether an academic or ethical body
                stood behind it, or whether the gaming industry was funding a
                way into younger kids.
              </p>
              {/* ID variants: "Her kids are older teens, mostly past our age
                  range" · "She's a serving officer." */}
              <p>
                I told her the truth. We have no sponsor. We’re a small,
                self-funded startup. She nodded. That was it. Her kids are
                teenagers, mostly past our age range, and she wasn’t shopping.
                She’s an active-duty officer. This is her family’s story as she
                told it to me, and none of it is an endorsement of us or anyone
                else. What she handed me instead was better: the questions
                every parent should be asking programs like ours, put more
                sharply than I could have put them myself.
              </p>
              {/* VERIFY vs video before dissemination — [18:49] */}
              <p>
                And one of her doubts I want to leave here exactly as she left
                it with me, unanswered. She isn’t convinced online play teaches
                real group skills at all: “at no point would you ever in a
                group dynamic yell and holler at the top of your lungs at
                somebody.” Kids need rooms, she thinks, more than they need
                servers. I didn’t argue. She’s partly right, and the in-person
                part of this problem is the part everyone working on it,
                including us, is still learning.
              </p>

              <p>
                Somewhere in the middle she assigned me homework. The Anxious
                Generation, by Jonathan Haidt. She quoted it so often she
                apologized for it, and when I described what an after-school
                gaming room looks like, she connected it to the book’s case for
                third spaces, real places where kids gather around something
                they care about. I wrote the title down while we talked. I’ve
                started it. A 21-year-old gamer taking a reading list from the
                officer who banned Fortnite, both of us delighted about it, is
                about as good a picture of this project as I can give.
              </p>

              <h2>Chair flying</h2>
              {/* ID variant: "half expecting her to laugh at them"
                  VERIFY vs video before dissemination — [17:48] */}
              <p>
                Near the end I brought up flight simulators, half expecting an
                actual pilot to laugh at them. Instead the pilot took over from
                the mom. She told me about chair flying, the discipline where
                military aviators rehearse a flight before they ever touch the
                aircraft: “mentally walking through every step you’re going to
                take in order to practice.” A simulator, she said, puts your
                mind in the environment.
              </p>
              {/* FACT: "Official Military Branch Esports Programs" — fact
                  library, official service sources.
                  ID variant: delete the task-force sentence entirely. */}
              <p>
                The military plays, too. The Army fields an official esports
                team, the Navy stood one up by official message, and Air Force
                Gaming is the Air Force’s own program for Airmen and Guardians.
                A research task force she’s loosely connected to at work
                teaches wargaming alongside PhDs who study games. Inside her
                world, the idea that games rehearse real judgment is an old
                assumption with a budget line.
              </p>

              {/* ID variant: "told me her community holds a lot more stories
                  like hers" */}
              <p>
                She closed the call wishing me luck, and told me the military
                community holds a lot more stories like hers: families who
                moved a kid across the world and watched a game be the thing
                that traveled with him. I believe her. I want to hear every one
                of them.
              </p>
              {/* ID variant: "watching her kid come back" */}
              <p>
                I keep coming back to the coin. She reached her conclusions by
                banning one game, watching her son come back, and then reading
                everything she could about why. I reached mine by playing, and
                by watching games give me a social life I couldn’t build
                anywhere else. Opposite ends, same landing spot.
              </p>
              <p>
                She banned the one that only took. She kept the ones that gave.
                Which kind a kid lands in is mostly up to the adults nearby.
              </p>
              <p className="italic text-black/60">
                Kassi is a real parent. Her surname, unit, and base do not
                appear here, by design, and her story is told the way she told
                it to me. It travels no further until she has read every word
                and told us it is right.
              </p>
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
